const mysql = require('promise-mysql');

// Load environment variables (only for local development)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const connectToDatabase = async () => {
  try {
    const config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      connectionLimit: 10,
    };

    if (process.env.NODE_ENV === 'production') {
      // Production: Use Cloud SQL socket
      config.socketPath = `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`;
    } else {
      // Local development: Use Cloud SQL public IP
      config.host = '34.42.3.185'; // Replace with your actual Cloud SQL public IP
      config.port = 3306;
    }

    console.log('Attempting to connect to the database...');

    const pool = await mysql.createPool(config);

    // Test the connection
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();

    console.log('Database connection successful');
    return pool;

  } catch (error) {
    console.error('Database connection failed:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      address: error.address,
      environment: process.env.NODE_ENV,
    });
    throw error;
  }
};

module.exports.setup = connectToDatabase;
