// server.js  
const express = require('express');  
const cors = require('cors');  
const mysql = require('mysql2/promise'); // Add mysql2 require

const app = express();  
// Use port provided by Render or default to 3000 for local dev
const PORT = process.env.PORT || 3000;  

// --- MySQL Connection Pool using Environment Variables --- 
const dbPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',      // Read from env var or default
  user: process.env.DB_USER || 'root',           // Read from env var or default
  password: process.env.DB_PASSWORD || 'root',       // Read from env var or default
  database: process.env.DB_NAME || 'mobile',       // Read from env var or default
  waitForConnections: true,
  connectionLimit: 10, // Adjust as needed for Render plans
  queueLimit: 0
});

// Test DB connection on startup
dbPool.getConnection()
  .then(connection => {
    console.log('MySQL DB connected successfully!');
    connection.release(); // Release the connection back to the pool
  })
  .catch(err => {
    console.error('Error connecting to MySQL DB:', err);
    // Consider exiting the process if DB connection fails on startup?
    // process.exit(1);
  });

// --- Middleware ---
app.use(cors());  

// --- API Endpoint --- 
app.get('/news', async (req, res) => {  
  console.log('Request received for /news'); 
  
  let connection;
  try {
    connection = await dbPool.getConnection();
    // *** IMPORTANT: Replace 'news_articles' with your actual table name ***
    // *** IMPORTANT: Ensure columns match Article properties (title, description, urlToImage, url) ***
    const [rows] = await connection.query('SELECT title, description, urlToImage, url FROM news_articles'); 
    
    res.json(rows); // Send data fetched from DB

  } catch (error) {
    console.error('Error fetching news from MySQL DB:', error);
    res.status(500).json({ message: 'Error fetching news data' });
  } finally {
    if (connection) connection.release(); // Ensure connection is always released
  }
});  

// --- Start Server ---
app.listen(PORT, () => {  
 console.log(`Server running on port ${PORT}`); 
 console.log(`Attempting to connect to MySQL DB ${process.env.DB_NAME || 'mobile'} on ${process.env.DB_HOST || 'localhost'} as user ${process.env.DB_USER || 'root'}.`); 
}); 