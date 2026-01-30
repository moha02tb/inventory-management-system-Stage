const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, roleRestrict } = require('../middleware/authMiddleware'); // Import the middleware

// --- CRUD Routes for Produit ---

// POST /api/products: Create a new product. 
// Requires login (protect) AND must have the 'admin' role.
router.post(
    '/', 
    protect, 
    roleRestrict('admin'), 
    productController.createProduct
);

// GET /api/products: Fetch all products with category names. 
// Requires login (protect) for staff or admin.
router.get(
    '/', 
    protect, 
    productController.getAllProducts
);

// [Optional] PUT /api/products/:id: Update product details. 
// Requires login (protect) AND must have the 'admin' role.
router.put(
    '/:id', 
    protect, 
    roleRestrict('admin'), 
    productController.updateProduct
);

// [Optional] DELETE /api/products/:id: Delete a product. 
// Requires login (protect) AND must have the 'admin' role.
router.delete(
    '/:id', 
    protect, 
    roleRestrict('admin'), 
    productController.deleteProduct
);


module.exports = router;