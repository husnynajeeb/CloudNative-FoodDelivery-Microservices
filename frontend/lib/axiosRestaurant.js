import axios from 'axios';
import { getToken } from './tokenHelpers';

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_RESTAURANT_URL,
});

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
