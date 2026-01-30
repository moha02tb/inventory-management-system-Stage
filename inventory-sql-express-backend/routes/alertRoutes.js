const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { protect, roleRestrict } = require('../middleware/authMiddleware');

// GET /api/alerts: View all OPEN stock alerts. 
// Requires login and should probably be restricted to Admins for actionability.
router.get(
    '/', 
    protect, 
    roleRestrict('admin'), // Only Admins need to see and act on alerts
    alertController.getOpenAlerts
);

module.exports = router;