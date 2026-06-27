import api from './fetchInstance';

export const getStats = () => api.get('/seller/stats');
export const getProducts = (params) => api.get('/seller/products', { params });
export const getOrders = (params) => api.get('/seller/orders', { params });
export const updateOrderStatus = (id, status) => api.patch(`/seller/orders/${id}/status`, { status });

const sellerAPI = { getStats, getProducts, getOrders, updateOrderStatus };
export default sellerAPI;
