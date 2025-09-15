import axios from "axios";

/**
 * Axios instance with interceptors
 * Configured with base backend URL and JWT token support.
 */
const API = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 10000,
});

// Request interceptor - automatically attach JWT token
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;

