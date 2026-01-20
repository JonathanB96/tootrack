import axios from "axios";
import { getToken, clearAuth } from "../auth/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // If token expired/invalid, clean logout
    if (err?.response?.status === 401) {
      clearAuth();
    }
    return Promise.reject(err);
  }
);

export default api;
