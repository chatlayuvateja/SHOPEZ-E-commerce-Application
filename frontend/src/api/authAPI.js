import api from './fetchInstance';

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const updatePassword = (data) => api.patch('/auth/update-password', data);
export const refreshToken = () => api.post('/auth/refresh-token');

const authAPI = { register, login, logout, getMe, updatePassword, refreshToken };
export default authAPI;
