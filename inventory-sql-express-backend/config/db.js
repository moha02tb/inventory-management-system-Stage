const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool using environment variables
const pool = mysql.createPool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise(); // Use .promise() to allow async/await syntax

// A function to execute queries
const query = (text, params) => pool.query(text, params);

module.exports = {
    query,
};