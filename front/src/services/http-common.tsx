import axios from "axios";
import { API_URL } from "@/config/config";

const api = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
});

api.interceptors.request.use((config) => {
    const method = config.method?.toUpperCase();
    if (method && ["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
        const cookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith("XSRF-TOKEN="));
        const token = cookie ? decodeURIComponent(cookie.split("=")[1]) : null;

        if (token) {
            config.headers["X-XSRF-TOKEN"] = token;
        } else {
           
            console.warn("XSRF-TOKEN not found, fetching...");
            api.get("/auth/csrf"); 
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403) {
            console.error(
                "403 Forbidden:",
                error.config?.url,
                "| CSRF header sent:",
                error.config?.headers?.["X-XSRF-TOKEN"] ?? "MISSING"
            );
        }
        return Promise.reject(error);
    }
);

export default api;