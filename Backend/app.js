'use strict';

const express = require('express');
const app = express();
const dotenv = require('dotenv');



const cors = require('cors');
app.use(cors()); // Allow all origins (you can customize this for security)
//  route handlers here
app.get('/api/events', (req, res) => {
    const events = [
        { event_id: 1, title: 'Tech Conference 2024', description: 'A conference about tech.', fee: 100.00, created_at: '2024-06-15' },
        { event_id: 2, title: 'Hackathon 2024', description: 'A coding competition.', fee: 50.00, created_at: '2024-07-10' }
    ];
    res.json({ events });
});







// Load environment variables
dotenv.config();

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
