import axios from "axios";

let BASE_URL = "";
if (import.meta.env.VITE_API_URL) {
  BASE_URL = import.meta.env.VITE_API_URL;
  if (!BASE_URL.endsWith("/api")) {
    BASE_URL = BASE_URL.replace(/\/$/, "") + "/api";
  }
} else if (import.meta.env.MODE === "development") {
  BASE_URL = "http://localhost:5001/api";
} else {
  BASE_URL = "/api";
}

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});