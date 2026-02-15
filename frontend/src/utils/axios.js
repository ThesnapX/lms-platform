import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to get token - helps with debugging
const getToken = () => localStorage.getItem("token");

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    console.log("Token present:", !!token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token added to headers:", token.substring(0, 20) + "...");
    } else {
      console.log("❌ No token found in localStorage");
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("❌ Response error:", {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      console.log("🔒 401 Unauthorized - Token might be invalid");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

// Set the token in default headers immediately
const token = getToken();
if (token) {
  axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  console.log("✅ Token set in default headers on initialization");
}

export default axiosInstance;
