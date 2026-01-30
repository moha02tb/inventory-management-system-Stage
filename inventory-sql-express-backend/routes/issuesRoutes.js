const express = require('express');
const issuesController = require('../controllers/issuesController');
const { protect, roleRestrict } = require('../middleware/authMiddleware');
const router = express.Router();

// Get issues report (admin only) - MUST BE FIRST
router.get('/admin/report', protect, roleRestrict('admin'), issuesController.getIssuesReport);

// Get all issues
router.get('/', protect, issuesController.getIssues);

// Add a new issue
router.post('/', protect, issuesController.addIssue);

// Update issue status (admin only)
router.put('/:id', protect, roleRestrict('admin'), issuesController.updateIssueStatus);

module.exports = router;
