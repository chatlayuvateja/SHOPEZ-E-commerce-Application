import api from './fetchInstance';

export const getAll = (params) => api.get('/products', { params });
export const getBySlug = (slug) => api.get(`/products/${slug}`);
export const getFeatured = () => api.get('/products/featured');
export const getCategories = () => api.get('/products/categories');
export const create = (data) => api.post('/products', data);
export const update = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

const productAPI = { getAll, getBySlug, getFeatured, getCategories, create, update, delete: deleteProduct };
export default productAPI;
