const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

// Generate and store an invoice for a sale
router.post('/:saleId', protect, invoiceController.createInvoiceForSale);

// Get invoice by sale id (latest for that sale)
router.get('/by-sale/:saleId', protect, invoiceController.getInvoiceBySale);

// Get invoice by invoice id
router.get('/:id', protect, invoiceController.getInvoiceById);

module.exports = router;
