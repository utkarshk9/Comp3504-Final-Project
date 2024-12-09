'use strict';

const express = require('express');
const app = express();
const cors = require('cors');

// Enable CORS for all routes
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            'https://aplalphacons.netlify.app',
            'https://675664dfe2579168feb163ba--aplalphacons.netlify.app', // Your preview URL
            'https://aplalphacons.netlify.app'
        ];
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('netlify.app')) {
            callback(null, true);
        } else {
            console.log('Blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Only load dotenv in development
if (process.env.NODE_ENV !== 'production') {
    try {
        require('dotenv').config();
    } catch (error) {
        console.log('dotenv not loaded in production');
    }
}

app.use(express.json());

// Set a default Content-Type for all responses
app.use((req, res, next) => {
    res.set('Content-Type', 'application/json');
    next();
});

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
