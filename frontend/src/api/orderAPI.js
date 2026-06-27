import api from './fetchInstance';

export const create = (data) => api.post('/orders', data);
export const getMyOrders = (params) => api.get('/orders/my-orders', { params });
export const getById = (id) => api.get(`/orders/${id}`);
export const cancel = (id, reason) => api.patch(`/orders/${id}/cancel`, { cancelReason: reason });

const orderAPI = { create, getMyOrders, getById, cancel };
export default orderAPI;
