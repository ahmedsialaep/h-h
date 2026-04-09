import axios from "axios";
import { API_URL } from "@/config/config";
import Cookies from 'js-cookie';

const AUTH_ENDPOINTS = [
    'auth/login',
    'auth/register',
    'auth/2fa/send',
    'auth/2fa/verify',
];
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
});

const ClearSession = async () => {
    try {

        await api.post("/auth/logout");
    } catch (e) {
        console.warn("Logout failed (ignored)");
    }

    localStorage.clear();

    window.location.href = "/login";
};

api.interceptors.request.use(async (config) => {
    const method = config.method?.toUpperCase();
    console.log("ALL COOKIES:", document.cookie);
    
    if (["POST", "PUT", "DELETE", "PATCH"].includes(method || "") && !AUTH_ENDPOINTS) {
        let token = Cookies.get("XSRF-TOKEN");

        if (token) {
            config.headers["X-XSRF-TOKEN"] = token;
        }
    }

    return config;
});

let isRedirecting = false;
let logoutInProgress = false;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        const url = error.config?.url;

        switch (status) {
            case 0:
                console.warn("[Auth] Network error:", url);
                break;

            case 401:
                if (!isRedirecting && !logoutInProgress) {
                    isRedirecting = true;
                    logoutInProgress = true;

                    console.warn("[Auth] 401 → logging out");
                    ClearSession();


                    isRedirecting = false;
                }
                break;

            case 403:
                console.warn(
                    "[Auth] 403 Forbidden:",
                    url,
                    "| CSRF:",
                    error.config?.headers?.["X-XSRF-TOKEN"] ?? "MISSING"
                );
                break;

            case 409:
                console.warn("[Auth] Session expired (409)");

                localStorage.clear();

                break;

            default:
                console.error(`[Auth] HTTP ${status} on:`, url);
        }

        return Promise.reject(error);
    }
);

export default api;