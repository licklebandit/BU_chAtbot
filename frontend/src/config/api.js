// src/config/api.js

/**
 * Dynamically determines the base URL for the API.
 * This function checks the hostname to switch between local and production environments.
 * * Assumes:
 * - Local backend runs on port 8000.
 * - Production backend is hosted at the Render URL.
 */
const getApiBaseUrl = () => {
    // Check if the current environment is running on localhost or a local IP
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        // Use the local backend URL (running on port 8000, confirmed in server.js)
        return "http://localhost:8000/api";
    }
    // Use the production URL (Replace with your actual Render URL if it changes)
    return "https://bu-chatbot.onrender.com/api";
};

// Export the base URL for use throughout the application
export const API_BASE_URL = getApiBaseUrl();

// Define the full base URL for admin-specific endpoints
export const ADMIN_API_URL = `${API_BASE_URL}/admin`;