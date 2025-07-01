// // ~/config/axiosInstance.ts
// import axios from 'axios';

// const axiosInstance = axios.create({
//   baseURL: 'http://localhost:8000/api',
//   withCredentials: true
// });

// axiosInstance.interceptors.request.use(config => {
//   const token =
//     localStorage.getItem('accessToken') ||
//     sessionStorage.getItem('accessToken');

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// export default axiosInstance;

// axiosConfig.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true
});

axiosInstance.interceptors.request.use(config => {
  const token =
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
