import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // đổi theo backend m
  headers: {
    "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"

  },
});

// gắn token tự động
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
