import axiosInstance from './axiosInstance';

const authAPI = {
  register: (data) => axiosInstance.post('/auth/register', data).then((res) => res.data),
  login: (data) => axiosInstance.post('/auth/login', data).then((res) => res.data),
  logout: () => axiosInstance.post('/auth/logout').then((res) => res.data),
  getMe: () => axiosInstance.get('/auth/me').then((res) => res.data),
  updatePassword: (data) => axiosInstance.patch('/auth/update-password', data).then((res) => res.data),
  refreshToken: () => axiosInstance.post('/auth/refresh-token').then((res) => res.data),
};

export default authAPI;
