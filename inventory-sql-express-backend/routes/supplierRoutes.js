const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { protect, roleRestrict } = require('../middleware/authMiddleware');

// Admin-only supplier management
router.use(protect, roleRestrict('admin'));

router.get('/', supplierController.listSuppliers);
router.post('/', supplierController.createSupplier);
router.put('/:id', supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router;
