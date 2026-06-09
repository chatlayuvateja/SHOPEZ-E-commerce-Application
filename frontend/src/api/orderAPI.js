import axiosInstance from './axiosInstance';

const orderAPI = {
  create: (data) => axiosInstance.post('/orders', data).then((res) => res.data),
  getMyOrders: (params) => axiosInstance.get('/orders/my-orders', { params }).then((res) => res.data),
  getById: (id) => axiosInstance.get(`/orders/${id}`).then((res) => res.data),
  cancel: (id, reason) => axiosInstance.patch(`/orders/${id}/cancel`, { cancelReason: reason }).then((res) => res.data),
};

export default orderAPI;
