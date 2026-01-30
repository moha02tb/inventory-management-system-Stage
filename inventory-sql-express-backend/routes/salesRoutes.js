const express = require('express');
const salesController = require('../controllers/salesController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Logging middleware
router.use((req, res, next) => {
    console.log(`\n📍 SALES ROUTE: ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// Get sales report with employee stats (admin only) - MUST BE FIRST
router.get('/admin/report', protect, salesController.getSalesReport);

// Get all sales
router.get('/', protect, salesController.getSales);

// Add a new sale
router.post('/', protect, salesController.addSale);

module.exports = router;
