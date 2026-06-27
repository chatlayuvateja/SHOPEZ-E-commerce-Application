import api from './fetchInstance';

export const getUsers = (params) => api.get('/admin/users', { params });
export const updateUserStatus = (id) => api.patch(`/admin/users/${id}/status`);
export const updateUserRole = (id, role) => api.patch(`/admin/users/${id}/role`, { role });
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getOrders = (params) => api.get('/admin/orders', { params });
export const getDashboardStats = () => api.get('/admin/dashboard-stats');

const adminAPI = { getUsers, updateUserStatus, updateUserRole, deleteUser, getOrders, getDashboardStats };
export default adminAPI;
