import axios from "axios";

/**
 * Axios instance
 * Configured with base backend URL and JWT token support.
 */
const API = axios.create({
  baseURL: "http://localhost:5000", // Backend API base URL
});

/**
 * Request interceptor
 * Automatically attaches JWT token (if present) to protected requests.
 */
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
