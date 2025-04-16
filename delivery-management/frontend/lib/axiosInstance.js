import axios from 'axios';
import { getToken } from './tokenHelpers';



const axiosInstance = axios.create({
  baseURL: `http://192.168.1.3:5000/api`,
});


console.log('API URL:', process.env.EXPO_PUBLIC_API_URL); // ✅ Valid here
axiosInstance.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;
