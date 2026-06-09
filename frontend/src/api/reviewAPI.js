import axiosInstance from './axiosInstance';

const reviewAPI = {
  getProductReviews: (productId, params) =>
    axiosInstance.get(`/reviews/product/${productId}`, { params }).then((res) => res.data),
  create: (data) => axiosInstance.post('/reviews', data).then((res) => res.data),
  delete: (id) => axiosInstance.delete(`/reviews/${id}`).then((res) => res.data),
};

export default reviewAPI;
