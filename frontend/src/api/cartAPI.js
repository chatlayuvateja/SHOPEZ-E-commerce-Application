import api from './fetchInstance';

export const getCart = () => api.get('/cart');
export const addToCart = (data) => api.post('/cart/add', data);
export const updateItem = (data) => api.patch('/cart/update', data);
export const removeFromCart = (productId) => api.delete(`/cart/remove/${productId}`);
export const clearCart = () => api.delete('/cart/clear');

const unwrapCart = (res) => res.cart || res;
const cartAPI = {
  getCart: () => getCart().then(unwrapCart),
  addToCart: (data) => addToCart(data).then(unwrapCart),
  updateItem: (data) => updateItem(data).then(unwrapCart),
  removeFromCart: (productId) => removeFromCart(productId).then(unwrapCart),
  clearCart: () => clearCart().then(unwrapCart),
};

export default cartAPI;
