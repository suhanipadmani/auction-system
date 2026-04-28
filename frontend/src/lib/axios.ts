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
    // Session expiry handling
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth-storage");
    }

    // Extract structured error from backend
    const apiError = error.response?.data;
    if (apiError && apiError.errorCode) {
      // Attach the errorCode to the error object so hooks can use it for translation
      error.errorCode = apiError.errorCode;
    }

    return Promise.reject(error);
  }
);
