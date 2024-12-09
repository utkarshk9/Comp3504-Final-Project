const mysql = require('promise-mysql');

// Load environment variables for non-production environments
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Validate required environment variables
const requiredEnvVars = ['DB_USER', 'DB_PASS', 'DB_NAME', 'DB_HOST', 'DB_PORT'];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Environment variable ${varName} is missing. Please check your .env file or environment settings.`);
    process.exit(1); // Exit the process if any required variable is missing
  }
});

let pool; // Connection pool variable

const connectToDatabase = async () => {
  try {
    pool = await mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1', // Default host
      port: process.env.DB_PORT || 3306,       // Default MySQL port
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      connectionLimit: 10,        // Max number of connections
      connectTimeout: 10000,     // 10 seconds
      acquireTimeout: 10000,     // 10 seconds
      waitForConnections: true,  // Default behavior
      queueLimit: 0,             // Unlimited queue
    });

    console.log('Database connection pool created successfully.');
    return pool;
  } catch (error) {
    console.error('Error creating database connection pool:', error.message);
    console.error(`Database Host: ${process.env.DB_HOST}, Port: ${process.env.DB_PORT}`);
    throw error; // Re-throw the error to handle it elsewhere
  }
};

// Gracefully close the database pool on application shutdown
const closeDatabaseConnection = async () => {
  try {
    if (pool) {
      await pool.end();
      console.log('Database connection pool closed successfully.');
    }
  } catch (error) {
    console.error('Error closing the database connection pool:', error.message);
  }
};

// Export setup and close functions
module.exports = {
  setup: connectToDatabase,
  close: closeDatabaseConnection,
};

