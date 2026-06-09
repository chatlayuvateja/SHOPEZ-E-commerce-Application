import axiosInstance from './axiosInstance';

const sellerAPI = {
  getStats: () => axiosInstance.get('/seller/stats').then((res) => res.data),
  getProducts: (params) => axiosInstance.get('/seller/products', { params }).then((res) => res.data),
  getOrders: (params) => axiosInstance.get('/seller/orders', { params }).then((res) => res.data),
  updateOrderStatus: (id, status) => axiosInstance.patch(`/seller/orders/${id}/status`, { status }).then((res) => res.data),
};

export default sellerAPI;
