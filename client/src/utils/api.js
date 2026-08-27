import axios from 'axios';

// 1. Create a customized instance of Axios
const api = axios.create({
  // Since our Vite proxy handles '/api', we can set this as a base URL
  // so we don't have to type '/api' in every single request!
  baseURL: '/api', 
});

// 2. Add a Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Check if there is a token in Local Storage
    const token = localStorage.getItem('token');

    // If a token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Let the modified request continue on its way
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;