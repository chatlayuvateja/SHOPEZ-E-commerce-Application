import axiosInstance from './axiosInstance';

const cartAPI = {
  getCart: () => axiosInstance.get('/cart').then((res) => res.data),
  addToCart: (data) => axiosInstance.post('/cart/add', data).then((res) => res.data),
  updateItem: (data) => axiosInstance.patch('/cart/update', data).then((res) => res.data),
  removeFromCart: (productId) => axiosInstance.delete(`/cart/remove/${productId}`).then((res) => res.data),
  clearCart: () => axiosInstance.delete('/cart/clear').then((res) => res.data),
};

export default cartAPI;
