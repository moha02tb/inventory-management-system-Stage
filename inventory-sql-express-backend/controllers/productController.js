const db = require('../config/db'); // MySQL connection pool

// Normalize quantity from common payload keys to a single number
const normalizeQuantity = (body = {}) => {
    const { quantite, quantiteAc, quantity, quantitAc, quantité } = body;
    const raw = quantite ?? quantiteAc ?? quantitAc ?? quantity ?? quantité ?? body['quantité'] ?? body['quantitAc'] ?? 0;
    const num = Number(raw);
    return Number.isFinite(num) ? num : NaN;
};

// Ensure a supplier exists before linking
const requireSupplier = async (fournisseurId) => {
    if (fournisseurId === undefined || fournisseurId === null) {
        throw Object.assign(new Error('Supplier is required'), { status: 400 });
    }
    const id = Number(fournisseurId);
    if (Number.isNaN(id)) {
        throw Object.assign(new Error('Invalid supplier id'), { status: 400 });
    }

    const [[supplier]] = await db.query('SELECT id FROM fournisseur WHERE id = ?', [id]);
    if (!supplier) {
        throw Object.assign(new Error('Supplier not found'), { status: 404 });
    }
    return id;
};

// =======================================================
// CREATE Product (POST /api/products)
// =======================================================
exports.createProduct = async (req, res) => {
    const { nom, prix, minStock, lowStockAlert, maxStock, categorieId, fournisseurId } = req.body;
    const quantite = normalizeQuantity(req.body);

    if (!nom) {
        return res.status(400).json({ error: 'Product name is required' });
    }
    if (!Number.isFinite(quantite)) {
        return res.status(400).json({ error: 'Quantity must be a number' });
    }

    try {
        const supplierId = await requireSupplier(fournisseurId);

        const text = `
            INSERT INTO produit (nom, \`quantité\`, prix, minStock, lowStockAlert, maxStock, categorieId, fournisseurId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const values = [nom, quantite, prix, minStock, lowStockAlert, maxStock, categorieId, supplierId];

        const [result] = await db.query(text, values);
        res.status(201).json({ 
            id: result.insertId,
            msg: 'Product created successfully'
        });
    } catch (err) {
        const status = err.status || 500;
        console.error('Error creating product:', err.message);
        res.status(status).json({ error: err.message || 'Failed to create product' });
    }
};

// =======================================================
// READ All Products (GET /api/products)
// =======================================================
exports.getAllProducts = async (req, res) => {
    const text = `
        SELECT
            p.id, p.nom, p.\`quantité\`, p.prix, p.minStock, p.maxStock,
            p.fournisseurId,
            c.nom AS categorieNom,
            f.nom AS fournisseurNom
        FROM produit p
        JOIN categorie c ON p.categorieId = c.id
        LEFT JOIN fournisseur f ON p.fournisseurId = f.id;
    `;
    
    try {
        const [rows] = await db.query(text); 
        res.status(200).json(rows);
    } catch (err) {
        console.error('Error fetching products:', err.message);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

// =======================================================
// UPDATE Product (PUT /api/products/:id)
// =======================================================
exports.updateProduct = async (req, res) => {
    const productId = req.params.id;
    const { nom, prix, minStock, lowStockAlert, maxStock, categorieId, fournisseurId } = req.body;
    const quantite = normalizeQuantity(req.body);

    if (!nom) {
        return res.status(400).json({ error: 'Product name is required' });
    }
    if (!Number.isFinite(quantite)) {
        return res.status(400).json({ error: 'Quantity must be a number' });
    }

    try {
        const supplierId = await requireSupplier(fournisseurId);

        const text = `
            UPDATE produit
            SET nom = ?, \`quantité\` = ?, prix = ?, minStock = ?, lowStockAlert = ?, maxStock = ?, categorieId = ?, fournisseurId = ?
            WHERE id = ?;
        `;
        const values = [nom, quantite, prix, minStock, lowStockAlert, maxStock, categorieId, supplierId, productId];
        
        await db.query(text, values);
        res.status(200).json({ msg: 'Product updated successfully' });
    } catch (err) {
        const status = err.status || 500;
        console.error('Error updating product:', err.message);
        res.status(status).json({ error: err.message || 'Failed to update product' });
    }
};

// =======================================================
// DELETE Product (DELETE /api/products/:id)
// =======================================================
exports.deleteProduct = async (req, res) => {
    const productId = req.params.id;
    
    const text = `DELETE FROM produit WHERE id = ?;`;
    
    try {
        await db.query(text, [productId]);
        res.status(200).json({ msg: `Product with ID ${productId} deleted successfully` });
    } catch (err) {
        console.error('Error deleting product:', err.message);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};
