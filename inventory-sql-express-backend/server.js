const express = require('express');
const cors = require('cors');
require('dotenv').config();

// --- Database Connection ---
const db = require('./config/db');

// --- Configuration ---
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

// --- Import Routes ---
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const movementRoutes = require('./routes/movementRoutes');
const alertRoutes = require('./routes/alertRoutes');
const salesRoutes = require('./routes/salesRoutes');
const issuesRoutes = require('./routes/issuesRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const supplierRoutes = require('./routes/supplierRoutes');

const app = express();

// -----------------------------------------------------------------
// CORS: allow configured client origin
// -----------------------------------------------------------------
const corsOptions = {
    origin: CLIENT_ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};
app.use(cors(corsOptions));

// -----------------------------------------------------------------
// Middleware
// -----------------------------------------------------------------
app.use(express.json()); // parse JSON bodies

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/movements', movementRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/suppliers', supplierRoutes);

// --- Root Test Route ---
app.get('/', (req, res) => {
    res.send('Inventory Management API is operational!');
});

// --- 404 Handler ---
app.use((req, res) => {
    console.log('404 - Route not found:', req.method, req.path);
    res.status(404).json({ msg: 'Route not found', path: req.path });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error('Global Error:', err.message, err.stack);
    res.status(err.status || 500).json({
        msg: 'Server error',
        error: err.message,
    });
});

// --- Server Startup ---
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    // Test Database connection on startup
    try {
        await db.query('SELECT NOW()');
        console.log('Database connected successfully!');
    } catch (error) {
        console.error('Database connection FAILED! Check XAMPP and .env configuration.');
        console.error('Error:', error.message);
    }
});
