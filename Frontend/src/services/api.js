import axios from 'axios';

// Create an instance of axios
const API = axios.create({
    baseURL: 'http://localhost:8080/api', // Replace with your backend URL
    timeout: 5000, // Set a timeout limit (5 seconds)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Remove or modify any console.logs in interceptors
API.interceptors.request.use(
    (config) => {
        // Only log non-sensitive information
        if (config.method && config.url) {
            console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default API;
