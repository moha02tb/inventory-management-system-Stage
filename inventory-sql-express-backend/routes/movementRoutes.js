const express = require('express');
const router = express.Router();
const movementController = require('../controllers/movementController');
const { protect, roleRestrict } = require('../middleware/authMiddleware'); // Require admin

// POST /api/movements: Record a new stock movement. 
// Admin only.
router.post('/', protect, roleRestrict('admin'), movementController.recordMovement);

// GET /api/movements: View the full movement history. 
// Admin only.
router.get('/', protect, roleRestrict('admin'), movementController.getAllMovements);

module.exports = router;
