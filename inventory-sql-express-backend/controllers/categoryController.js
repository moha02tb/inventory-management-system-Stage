
const db = require('../config/db'); // Your MySQL database connection/config file

/**
 * @desc Fetch all categories from the database
 * @route GET /api/categories
 * @access Private (Requires authentication)
 */
exports.getAllCategories = async (req, res) => {
    // CRITICAL FIX: Change the table name from 'categories' (plural) 
    // to 'categorie' (singular) to match your actual database table.
    const sql = 'SELECT id, nom FROM categorie'; 
    
    try {
        const [categories] = await db.query(sql); 
        res.status(200).json(categories); 

    } catch (error) {
        console.error('Database error fetching categories:', error.message);
        // The error is now specific (Table 'inventory_db.categories' doesn't exist)
        res.status(500).json({ message: 'Internal Server Error fetching categories' });
    }
};