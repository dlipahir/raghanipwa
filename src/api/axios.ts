import axios from "axios";

const baseURL = `${import.meta.env.VITE_BACKEND_URL}/api` ;

console.log(baseURL)
// Axios instance without access token
export const axiosNoAuth = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Axios instance with access token
export const axiosAuth = axios.create({
  baseURL,
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

// Add a request interceptor to inject the access token
axiosAuth.interceptors.request.use(
  (config) => {
    // You can change how you get the token as per your auth implementation
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
