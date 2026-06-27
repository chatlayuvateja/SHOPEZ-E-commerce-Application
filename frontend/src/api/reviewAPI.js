import api from './fetchInstance';

export const getProductReviews = (productId, params) => api.get(`/reviews/product/${productId}`, { params });
export const create = (data) => api.post('/reviews', data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

const reviewAPI = { getProductReviews, create, delete: deleteReview };
export default reviewAPI;
