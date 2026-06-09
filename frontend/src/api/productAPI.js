import axiosInstance from './axiosInstance';

const productAPI = {
  getAll: (params) => axiosInstance.get('/products', { params }).then((res) => res.data),
  getBySlug: (slug) => axiosInstance.get(`/products/${slug}`).then((res) => res.data),
  getFeatured: () => axiosInstance.get('/products/featured').then((res) => res.data),
  getCategories: () => axiosInstance.get('/products/categories').then((res) => res.data),
  create: (data) => axiosInstance.post('/products', data).then((res) => res.data),
  update: (id, data) => axiosInstance.put(`/products/${id}`, data).then((res) => res.data),
  delete: (id) => axiosInstance.delete(`/products/${id}`).then((res) => res.data),
};

export default productAPI;
