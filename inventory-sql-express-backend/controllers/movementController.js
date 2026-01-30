const db = require('../config/db');

// Normalize quantity from common payload keys to a single number
const normalizeQuantity = (body = {}) => {
    const { quantite, quantiteAc, quantity, quantitAc, quantité } = body;
    const raw = quantite ?? quantiteAc ?? quantitAc ?? quantity ?? quantité ?? body['quantitAc'] ?? body['quantité'] ?? 0;
    const num = Number(raw);
    return Number.isFinite(num) ? num : NaN;
};

// Ensure a supplier exists before linking
const requireSupplier = async (fournisseurId) => {
    if (fournisseurId === undefined || fournisseurId === null) {
        throw Object.assign(new Error('Supplier is required for this movement'), { status: 400 });
    }
    const id = Number(fournisseurId);
    if (Number.isNaN(id)) {
        throw Object.assign(new Error('Invalid fournisseurId. It must be a number.'), { status: 400 });
    }
    const [[supplier]] = await db.query('SELECT id FROM fournisseur WHERE id = ?', [id]);
    if (!supplier) {
        throw Object.assign(new Error('Supplier not found'), { status: 404 });
    }
    return id;
};

// =======================================================
// CREATE Stock Movement (POST /api/movements)
// =======================================================
exports.recordMovement = async (req, res) => {
    // Get product ID, quantity, type (IN/OUT/ADJUST/SALE), reason, and the supplier providing the product
    const { produitId, type, raison, fournisseurId } = req.body;
    const quantite = normalizeQuantity(req.body);
    const typeNorm = (type ?? '').toString().trim().toUpperCase();

    // The user ID and role are passed through the 'protect' middleware
    const utilisateurId = req.user.id; 
    const parsedProductId = Number(produitId);
    const allowedTypes = new Set(['IN', 'OUT', 'ADJUST', 'SALE']);

    if (Number.isNaN(parsedProductId)) {
        return res.status(400).json({ error: 'Invalid produitId. It must be a number.' });
    }
    if (!Number.isFinite(quantite)) {
        return res.status(400).json({ error: 'Quantity must be a number' });
    }
    if (!allowedTypes.has(typeNorm)) {
        return res.status(400).json({ error: 'Invalid movement type. Use IN, OUT, ADJUST, or SALE.' });
    }
    const absQty = Math.abs(quantite);
    if (absQty === 0) {
        return res.status(400).json({ error: 'Quantity must be greater than zero' });
    }

    // Derive the signed delta server-side to avoid trusting client sign
    const delta = typeNorm === 'IN' ? absQty : -absQty;

    let product;
    try {
        const [products] = await db.query('SELECT id, fournisseurId FROM produit WHERE id = ?', [parsedProductId]);
        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        product = products[0];
    } catch (err) {
        console.error('Error validating product for movement:', err.message);
        return res.status(500).json({ error: 'Failed to validate product before recording movement.' });
    }

    // Decide which supplier to attach: prefer the product's supplier. Require a supplier only for inbound moves.
    let movementSupplierId = product.fournisseurId ? Number(product.fournisseurId) : null;
    try {
        if (movementSupplierId) {
            if (fournisseurId && Number(fournisseurId) !== movementSupplierId) {
                return res.status(400).json({ error: 'Provided supplier does not match the product supplier.' });
            }
            movementSupplierId = await requireSupplier(movementSupplierId); // revalidate exists
        } else if (typeNorm === 'IN') {
            movementSupplierId = await requireSupplier(fournisseurId);
        } else if (fournisseurId) {
            movementSupplierId = await requireSupplier(fournisseurId);
        }
    } catch (err) {
        const status = err.status || 500;
        return res.status(status).json({ error: err.message });
    }

    // Insert movement and update stock atomically; if stock would go negative, rollback.
    try {
        await db.query('START TRANSACTION');

        const [movementResult] = await db.query(
            `
            INSERT INTO mouvementstock (produitId, utilisateurId, type, \`quantité\`, raison, fournisseurId)
            VALUES (?, ?, ?, ?, ?, ?);
            `,
            [parsedProductId, utilisateurId, typeNorm, delta, raison, movementSupplierId]
        );

        const [updateResult] = await db.query(
            `
            UPDATE produit
            SET \`quantité\` = \`quantité\` + ?
            WHERE id = ? AND \`quantité\` + ? >= 0;
            `,
            [delta, parsedProductId, delta]
        );

        if (updateResult.affectedRows === 0) {
            await db.query('ROLLBACK');
            return res.status(409).json({ error: 'Insufficient stock for this movement' });
        }

        await db.query('COMMIT');

        res.status(201).json({ 
            id: movementResult.insertId,
            msg: `Movement of ${delta} unit(s) recorded successfully. Stock updated.`
        });
    } catch (err) {
        console.error('Error recording movement:', err.message);
        try { await db.query('ROLLBACK'); } catch (rollbackErr) {
            console.error('Rollback failed:', rollbackErr.message);
        }
        res.status(500).json({ error: 'Failed to record movement. Check product ID and type.' });
    }
};

// =======================================================
// READ All Stock Movements (GET /api/movements)
// =======================================================
exports.getAllMovements = async (req, res) => {
    // Fetches movement history, joining with product, user, and supplier details
    const text = `
        SELECT 
            m.id, m.\`quantité\`, m.type, m.date, m.raison,
            p.nom AS produitNom,
            u.nom AS utilisateurNom,
            f.id AS fournisseurId,
            f.nom AS fournisseurNom
        FROM mouvementstock m
        JOIN produit p ON m.produitId = p.id
        JOIN utilisateur u ON m.utilisateurId = u.id
        LEFT JOIN fournisseur f ON m.fournisseurId = f.id
        ORDER BY m.date DESC;
    `;
    
    try {
        const [rows] = await db.query(text);
        res.status(200).json(rows);
    } catch (err) {
        console.error('Error fetching movements:', err.message);
        res.status(500).json({ error: 'Failed to fetch stock movements.' });
    }
};
