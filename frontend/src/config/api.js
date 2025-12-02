const FALLBACK_PROD_URL = "https://bu-chatbot.onrender.com";

const sanitize = (value = "") => value.replace(/\/$/, "");

const inferRootFromWindow = () => {
    if (typeof window === "undefined") return "";
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        return "http://localhost:8000";
    }
    return FALLBACK_PROD_URL;
};

const resolvedRoot =
    sanitize(process.env.REACT_APP_API_BASE_URL || "") ||
    sanitize(inferRootFromWindow()) ||
    FALLBACK_PROD_URL;

export const API_ROOT = sanitize(resolvedRoot);
export const API_BASE_URL = `${API_ROOT}/api`;
export const AUTH_BASE_URL = `${API_ROOT}/auth`;
export const ADMIN_API_URL = `${API_BASE_URL}/admin`;
export const SOCKET_URL = API_ROOT;