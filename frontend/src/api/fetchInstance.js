const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

async function request(method, endpoint, options = {}) {
  const { data, params } = options;

  let url = `${API_BASE}${endpoint}`;

  if (params && typeof params === 'object') {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const fetchOptions = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && method !== 'GET') {
    fetchOptions.body = JSON.stringify(data);
  }

  const response = await fetch(url, fetchOptions);

  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(errorBody.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = errorBody;
    throw error;
  }

  const responseData = await response.json();
  return responseData;
}

const api = {
  get: (endpoint, options) => request('GET', endpoint, options),
  post: (endpoint, data) => request('POST', endpoint, { data }),
  put: (endpoint, data) => request('PUT', endpoint, { data }),
  patch: (endpoint, data) => request('PATCH', endpoint, { data }),
  delete: (endpoint) => request('DELETE', endpoint),
};

export default api;
