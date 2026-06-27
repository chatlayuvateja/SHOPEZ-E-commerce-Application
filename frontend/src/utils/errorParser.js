const parseAPIError = (error) => {
  // Handle fetchInstance-style errors (error.status, error.data)
  if (error.status !== undefined) {
    if (error.data?.message) {
      return error.data.message;
    }
    if (error.data?.errors && Array.isArray(error.data.errors)) {
      return error.data.errors[0]?.message || 'Validation error. Please check your input.';
    }
    if (error.status === 401) return 'Please log in to continue.';
    if (error.status === 403) return 'You do not have permission to perform this action.';
    if (error.status === 404) return 'The requested resource was not found.';
    if (error.status >= 500) return 'Server error. Please try again later.';
  }

  // Handle axios-style errors (error.response) — fallback
  if (error.response) {
    if (error.response.data?.message) {
      return error.response.data.message;
    }
    if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
      return error.response.data.errors[0]?.message || 'Validation error. Please check your input.';
    }
    if (error.response.status === 401) return 'Please log in to continue.';
    if (error.response.status === 403) return 'You do not have permission to perform this action.';
    if (error.response.status === 404) return 'The requested resource was not found.';
    if (error.response.status >= 500) return 'Server error. Please try again later.';
  }

  if (error.request || error.code === 'ERR_NETWORK') {
    return 'Network error. Please check your connection.';
  }
  return 'Something went wrong. Please try again.';
};

export default parseAPIError;
