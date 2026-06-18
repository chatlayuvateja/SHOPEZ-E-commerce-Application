import axiosInstance from './axiosInstance';

const unwrapCart = (res) => res.data.cart || res.data;

const cartAPI = {
  getCart: () => axiosInstance.get('/cart').then(unwrapCart),
  addToCart: (data) => axiosInstance.post('/cart/add', data).then(unwrapCart),
  updateItem: (data) => axiosInstance.patch('/cart/update', data).then(unwrapCart),
  removeFromCart: (productId) => axiosInstance.delete(`/cart/remove/${productId}`).then(unwrapCart),
  clearCart: () => axiosInstance.delete('/cart/clear').then(unwrapCart),
};

export default cartAPI;
