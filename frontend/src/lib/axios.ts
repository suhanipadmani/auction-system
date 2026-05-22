import axios from "axios";

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("auth-storage");
      const token = raw ? JSON.parse(raw)?.state?.token : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore
    }
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth-storage");
      window.location.href = "/login";
    }
    const apiError = error.response?.data;
    if (apiError && apiError.errorCode) {
      error.errorCode = apiError.errorCode;
    }

    if (error.response?.status === 429 && !apiError?.message) {
      if (error.response.data) {
        error.response.data.message = "Too many requests. Please try again later.";
      } else {
        error.response.data = { message: "Too many requests. Please try again later." };
      }
    }

    return Promise.reject(error);
  }
);
