import React, { createContext, useReducer, useCallback, useEffect, useRef, useContext } from 'react';
import cartAPI from '../api/cartAPI';
import useAuth from '../hooks/useAuth';

const CartContext = createContext(null);

const initialState = {
  items: [],
  cartId: null,
  isLoading: false,
  isSyncing: false,
  error: null,
  lastSynced: null,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        items: action.payload.items || [],
        cartId: action.payload._id || null,
        error: null,
        lastSynced: Date.now(),
      };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'SYNC_START':
      return { ...state, isSyncing: true };
    case 'SYNC_END':
      return { ...state, isSyncing: false };
    case 'OPTIMISTIC_UPDATE':
      return { ...state, items: action.payload };
    case 'CLEAR_CART':
      return { ...initialState, lastSynced: Date.now() };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();
  const syncTimerRef = useRef(null);
  const pendingUpdates = useRef(null);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      dispatch({ type: 'CLEAR_CART' });
      return;
    }
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await cartAPI.getCart();
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      if (err.status === 404) {
        dispatch({ type: 'FETCH_SUCCESS', payload: { items: [] } });
      } else {
        dispatch({ type: 'FETCH_ERROR', payload: err.data?.message || 'Failed to load cart' });
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const debouncedSync = useCallback(
    (updater) => {
      pendingUpdates.current = updater;
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      dispatch({ type: 'SYNC_START' });
      syncTimerRef.current = setTimeout(async () => {
        try {
          const updaterFn = pendingUpdates.current;
          pendingUpdates.current = null;
          const result = await updaterFn();
          dispatch({ type: 'FETCH_SUCCESS', payload: result });
        } catch (err) {
          dispatch({ type: 'SYNC_END' });
          dispatch({ type: 'SET_ERROR', payload: err.data?.message || 'Failed to update cart' });
          fetchCart();
        }
      }, 300);
    },
    [fetchCart]
  );

  useEffect(() => {
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, []);

  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      const existingIndex = state.items.findIndex((item) => {
        const itemProductId = item.product?._id || item.product;
        return itemProductId === productId;
      });

      let newItems;
      if (existingIndex >= 0) {
        newItems = state.items.map((item, index) => {
          const itemProductId = item.product?._id || item.product;
          if (itemProductId === productId) {
            return { ...item, quantity: (item.quantity || 1) + quantity };
          }
          return item;
        });
      } else {
        let productInfo = state.items.find((item) => {
          const itemProductId = item.product?._id || item.product;
          return itemProductId === productId;
        });
        if (!productInfo) {
          newItems = [...state.items, { product: productId, quantity }];
        } else {
          newItems = [...state.items, { ...productInfo, product: productId, quantity }];
        }
      }

      dispatch({ type: 'OPTIMISTIC_UPDATE', payload: newItems });
      debouncedSync(() => cartAPI.addToCart({ product: productId, quantity }));
    },
    [state.items, debouncedSync]
  );

  const removeFromCart = useCallback(
    async (productId) => {
      const newItems = state.items.filter((item) => {
        const itemProductId = item.product?._id || item.product;
        return itemProductId !== productId;
      });
      dispatch({ type: 'OPTIMISTIC_UPDATE', payload: newItems });
      debouncedSync(() => cartAPI.removeFromCart(productId));
    },
    [state.items, debouncedSync]
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (quantity < 1) {
        removeFromCart(productId);
        return;
      }
      const newItems = state.items.map((item) => {
        const itemProductId = item.product?._id || item.product;
        if (itemProductId === productId) return { ...item, quantity };
        return item;
      });
      dispatch({ type: 'OPTIMISTIC_UPDATE', payload: newItems });
      debouncedSync(() => cartAPI.updateItem({ product: productId, quantity }));
    },
    [state.items, debouncedSync, removeFromCart]
  );

  const clearCart = useCallback(async () => {
    dispatch({ type: 'OPTIMISTIC_UPDATE', payload: [] });
    try {
      await cartAPI.clearCart();
      dispatch({ type: 'CLEAR_CART' });
    } catch {
      fetchCart();
    }
  }, [fetchCart]);

  const itemCount = state.items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const totalPrice = state.items.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    const qty = item.quantity || 1;
    return sum + price * qty;
  }, 0);

  const cartContextValue = {
    items: state.items,
    cartId: state.cartId,
    isLoading: state.isLoading,
    isSyncing: state.isSyncing,
    error: state.error,
    itemCount,
    totalPrice,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
  };

  return React.createElement(CartContext.Provider, { value: cartContextValue }, children);
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
