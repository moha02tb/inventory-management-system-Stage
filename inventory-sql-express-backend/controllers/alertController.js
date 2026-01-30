const db = require('../config/db');

// =======================================================
// READ All Open Stock Alerts (GET /api/alerts)
// =======================================================
exports.getOpenAlerts = async (req, res) => {
    // Fetches all open alerts, joining with product details
    const text = `
        SELECT 
            a.id, a.type, a.date, a.statut,
            p.nom AS produitNom,
            p.quantité AS currentQuantite,
            p.lowStockAlert AS threshold
        FROM alerteStock a
        JOIN produit p ON a.produitId = p.id
        WHERE a.statut = 'OPEN'
        ORDER BY a.date DESC;
    `;
    
    try {
        const [rows] = await db.query(text);
        res.status(200).json(rows);
    } catch (err) {
        console.error('Error fetching alerts:', err.message);
        res.status(500).json({ error: 'Failed to fetch stock alerts.' });
    }
};