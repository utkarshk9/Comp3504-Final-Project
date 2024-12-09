'use strict';

const express = require('express');
const app = express();

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
