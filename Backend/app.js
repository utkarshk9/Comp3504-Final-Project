'use strict';

const express = require('express');
const app = express();
const cors = require('cors');

// Enable CORS for all routes
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://your-frontend-domain.com'  // Add your deployed frontend domain
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Enable CORS for all routes
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://your-frontend-domain.com'  // Add your deployed frontend domain
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Enable CORS for all routes
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://your-frontend-domain.com'  // Add your deployed frontend domain
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Load environment variables
dotenv.config();

app.use(express.json());

// Set a default Content-Type for all responses
app.use((req, res, next) => {
    res.set('Content-Type', 'application/json');
    next();
});const cors = require('cors');

// Add this configuration to allow requests from specific origins
const corsOptions = {
    origin: 'http://localhost:3000', // Allow requests from this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
};

// Apply CORS middleware
app.use(cors(corsOptions));

 

// Function to start the server
const startServer = async () => {
    try {
        // Initialize database
        const database = require("./database.js");
        const db = await database.setup();

        // Register routes
        const routes = require('./routes/index.js');
        routes.register(app, db);

        // Get the port from environment variables or use the default
        const PORT = process.env.PORT || 8080;

        // Start the server
        const server = app.listen(PORT, () => {
            console.log(`App listening on port ${PORT}`);
            console.log('Press Ctrl+C to quit.');
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            console.error('Unhandled Rejection:', err);
            server.close(() => {
                process.exit(1); // Exit the process after gracefully closing the server
            });
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            console.error('Uncaught Exception:', err);
            server.close(() => {
                process.exit(1); // Exit the process after gracefully closing the server
            });
        });

        return server; // Return the server instance for testing or further use
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1); // Exit the process if the server fails to start
    }
};

// Start the server
startServer();
