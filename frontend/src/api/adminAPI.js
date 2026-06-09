import axiosInstance from './axiosInstance';

const adminAPI = {
  getUsers: (params) => axiosInstance.get('/admin/users', { params }).then((res) => res.data),
  updateUserStatus: (id) => axiosInstance.patch(`/admin/users/${id}/status`).then((res) => res.data),
  updateUserRole: (id, role) => axiosInstance.patch(`/admin/users/${id}/role`, { role }).then((res) => res.data),
  deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`).then((res) => res.data),
  getOrders: (params) => axiosInstance.get('/admin/orders', { params }).then((res) => res.data),
  getDashboardStats: () => axiosInstance.get('/admin/dashboard-stats').then((res) => res.data),
};

export default adminAPI;
