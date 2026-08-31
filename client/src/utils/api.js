import axios from 'axios';

const api = axios.create({
baseURL: 'https://smart-placement-platform-2l3x.onrender.com/api', // deployment url!
// baseURL: 'http://localhost:5000/api', // local URL for testing!
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;