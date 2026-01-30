
const express = require('express');
const router = express.Router();
// Assuming you have an authentication middleware function called 'protect'
const { protect } = require('../middleware/authMiddleware'); 
// Assuming you have a controller to handle the database logic
const categoryController = require('../controllers/categoryController'); 

// The GET route to fetch all categories requires authentication
router.route('/')
    .get(protect, categoryController.getAllCategories); 

module.exports = router;