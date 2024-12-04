import axios from 'axios';

// Create an instance of axios
const API = axios.create({
    baseURL: 'http://localhost:8080/api', // Replace with your backend URL
    timeout: 5000, // Set a timeout limit (5 seconds)
    headers: {
        'Content-Type': 'application/json',
    },
});



export default API;
