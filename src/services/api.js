import axios from "axios";

// Create Axios Instance
const API = axios.create({
  baseURL: "http://localhost:8000/api/v1", // Match your Backend URL
  withCredentials: true, // Important for Cookies
});

// Request Interceptor: Attach Token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Response Interceptor: Handle Token Expiry
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 (Unauthorized) and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Typically you'd call a refresh token endpoint here
        // For this project, we might just redirect to login
        localStorage.clear();
        window.location.href = "/login";
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default API;