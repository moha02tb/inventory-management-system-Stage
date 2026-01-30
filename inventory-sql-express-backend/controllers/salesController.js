// File: controllers/salesController.js

const { query } = require('../config/db');

// Normalize quantity from various payload keys to a single number
const normalizeQuantity = (payload = {}) => {
    const { quantity, quantitAc, quantite, quantiteAc, quantité } = payload;
    return Number(quantity ?? quantitAc ?? quantite ?? quantiteAc ?? quantité ?? payload['quantitAc'] ?? payload['quantité'] ?? 0);
};

// Get all sales
exports.getSales = async (req, res) => {
    try {
        const [results] = await query(
            `SELECT v.*, p.nom as productName, u.nom as employeeName
             FROM vente v
             JOIN produit p ON v.produitId = p.id
             LEFT JOIN utilisateur u ON v.utilisateurId = u.id
             ORDER BY v.date DESC`
        );
        res.json(results);
    } catch (error) {
        console.error('Error fetching sales:', error.message);
        res.status(500).json({ msg: 'Error fetching sales', error: error.message });
    }
};

// Add a new sale (atomic: sale + stock decrement + movement log)
exports.addSale = async (req, res) => {
    try {
        const { produitId, clientNom, dateSale, employeeRole } = req.body;
        const quantity = normalizeQuantity(req.body);

        console.log('Add Sale Request:', { produitId, quantity, dateSale });

        // Validate input
        if (!produitId || !quantity) {
            return res.status(400).json({ msg: 'Missing required fields: produitId, quantity' });
        }

        const delta = -Math.abs(quantity);
        const saleDate = dateSale || new Date().toISOString().split('T')[0];
        const utilisateurId = req.user?.id || null;

        await query('START TRANSACTION');

        // Check product stock + price
        const [product] = await query('SELECT `quantité`, `prix` FROM produit WHERE id = ?', [produitId]);
        console.log('Product check result:', product);

        if (product.length === 0) {
            await query('ROLLBACK');
            return res.status(404).json({ msg: 'Product not found' });
        }

        const currentStock = Number(product[0]['quantité']);
        if (!Number.isFinite(currentStock) || currentStock + delta < 0) {
            await query('ROLLBACK');
            return res.status(409).json({ msg: 'Insufficient stock' });
        }

        const unitPrice = Number(product[0]['prix'] ?? 0);
        const totalPrice = unitPrice * Math.abs(quantity);

        console.log('Inserting sale with:', { produitId, utilisateurId, quantity, saleDate });

        const [saleResult] = await query(
            'INSERT INTO vente (produitId, utilisateurId, `quantité`, `prixTotal`, date) VALUES (?, ?, ?, ?, ?)',
            [produitId, utilisateurId, quantity, totalPrice, saleDate]
        );

        const [updateResult] = await query(
            'UPDATE produit SET `quantité` = `quantité` + ? WHERE id = ? AND `quantité` + ? >= 0',
            [delta, produitId, delta]
        );

        if (updateResult.affectedRows === 0) {
            await query('ROLLBACK');
            return res.status(409).json({ msg: 'Insufficient stock' });
        }

        await query(
            `INSERT INTO mouvementstock (produitId, utilisateurId, type, \`quantité\`, raison, fournisseurId)
             VALUES (?, ?, 'SALE', ?, 'Vente client', NULL)`,
            [produitId, utilisateurId, delta]
        );

        await query('COMMIT');

        console.log('Sale inserted and stock updated:', saleResult);

        res.json({ msg: 'Sale recorded successfully', id: saleResult.insertId, totalPrice, unitPrice });
    } catch (error) {
        try { await query('ROLLBACK'); } catch (rollbackErr) {
            console.error('Rollback failed:', rollbackErr.message);
        }
        console.error('Error recording sale:', error.message, error.stack);
        res.status(500).json({ msg: 'Error recording sale', error: error.message });
    }
};

// Get sales report with employee performance stats
exports.getSalesReport = async (req, res) => {
    try {
        // Get all sales with product info
        const [sales] = await query(
            `SELECT v.*, p.nom as productName, u.nom as employeeName, u.nom as employeeFullName, u.role as employeeRole
             FROM vente v
             JOIN produit p ON v.produitId = p.id
             LEFT JOIN utilisateur u ON v.utilisateurId = u.id
             ORDER BY v.date DESC`
        );

        console.log('Sales data:', sales);

        // Get employee performance stats (exclude admins from ranking)
        const [stats] = await query(
            `SELECT v.utilisateurId,
                    u.nom as employeeName,
                    u.role as employeeRole,
                    COUNT(v.id) as salesCount,
                    SUM(v.\`quantité\`) as totalSales
             FROM vente v
             LEFT JOIN utilisateur u ON v.utilisateurId = u.id
             WHERE u.role IS NULL OR u.role <> 'admin'
             GROUP BY v.utilisateurId, u.nom, u.role
             ORDER BY totalSales DESC`
        );

        console.log('Stats data:', stats);

        res.json({ sales, stats });
    } catch (error) {
        console.error('Error fetching sales report:', error.message);
        res.status(500).json({ msg: 'Error fetching sales report', error: error.message });
    }
};

// Legacy function - kept for backward compatibility
exports.recordSale = async (req, res) => {
    const utilisateurId = req.user.id;
    const { produitId, prixUnitaire } = req.body;
    const quantity = normalizeQuantity(req.body);

    if (!produitId || !quantity || !prixUnitaire) {
        return res.status(400).json({ msg: 'Missing required sale fields: produitId, quantity, or prixUnitaire.' });
    }

    const prixTotal = quantity * prixUnitaire;

    try {
        await query('START TRANSACTION');

        const saleSql = `
            INSERT INTO vente (produitId, utilisateurId, \`quantité\`, prixTotal)
            VALUES (?, ?, ?, ?)
        `;
        await query(saleSql, [produitId, utilisateurId, quantity, prixTotal]);

        const movementSql = `
            INSERT INTO mouvementstock (produitId, utilisateurId, type, \`quantité\`, raison)
            VALUES (?, ?, ?, ?, 'Vente client')
        `;
        await query(movementSql, [produitId, utilisateurId, 'sale', -Math.abs(quantity)]);

        await query('COMMIT');

        res.status(201).json({
            msg: `Sale recorded for ${quantity} units. Stock reduced.`,
            prixTotal
        });
    } catch (err) {
        await query('ROLLBACK');
        console.error('Sale transaction failed:', err.message);
        res.status(500).json({ error: 'Failed to record sale. Transaction rolled back.' });
    }
};
