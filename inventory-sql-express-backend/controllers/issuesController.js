const { query } = require('../config/db');

// Get all issues for the current user
exports.getIssues = async (req, res) => {
    try {
        // Non-admins only see their own issues; admins see everything.
        const isAdmin = req.user?.role === 'admin';
        const sql = isAdmin
            ? 'SELECT * FROM issues ORDER BY createdAt DESC'
            : 'SELECT * FROM issues WHERE reportedBy = ? ORDER BY createdAt DESC';
        const params = isAdmin ? [] : [req.user.role];

        const [results] = await query(sql, params);
        res.json(results);
    } catch (error) {
        console.error('Error fetching issues:', error);
        res.status(500).json({ msg: 'Error fetching issues' });
    }
};

// Add a new issue report
exports.addIssue = async (req, res) => {
    try {
        const { type, description, produitId, damagedPieces, reportedBy, status } = req.body;
        
        // Validate input
        if (!type || !description || !produitId || !reportedBy) {
            return res.status(400).json({ msg: 'Missing required fields' });
        }

        const [result] = await query(
            `INSERT INTO issues (type, description, produitId, damagedPieces, reportedBy, status) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [type, description, produitId, damagedPieces || 0, reportedBy, status || 'pending']
        );
        
        res.json({ msg: 'Issue reported successfully', id: result.insertId });
    } catch (error) {
        console.error('Error reporting issue:', error);
        res.status(500).json({ msg: 'Error reporting issue' });
    }
};

// Get all issues for admin report
exports.getIssuesReport = async (req, res) => {
    try {
        const [results] = await query(
            `SELECT * FROM issues ORDER BY createdAt DESC`
        );
        res.json(results);
    } catch (error) {
        console.error('Error fetching issues report:', error);
        res.status(500).json({ msg: 'Error fetching issues report' });
    }
};

// Update issue status (admin only)
exports.updateIssueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ msg: 'Status is required' });
        }

        const [result] = await query(
            `UPDATE issues SET status = ?, updatedAt = NOW() WHERE id = ?`,
            [status, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Issue not found' });
        }
        
        res.json({ msg: 'Issue status updated successfully' });
    } catch (error) {
        console.error('Error updating issue:', error);
        res.status(500).json({ msg: 'Error updating issue' });
    }
};
