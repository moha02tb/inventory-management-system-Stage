const db = require('../config/db');

// Basic normalization helpers
const normalizeString = (val = '') => {
    const v = `${val}`.trim();
    return v === '' ? null : v;
};

// Validate supplier exists
const fetchSupplier = async (id) => {
    const [rows] = await db.query('SELECT * FROM fournisseur WHERE id = ?', [id]);
    return rows[0] || null;
};

exports.listSuppliers = async (_req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nom, contactNom, telephone, email, adresse, createdAt FROM fournisseur ORDER BY nom ASC');
        res.status(200).json(rows);
    } catch (err) {
        console.error('Error listing suppliers:', err.message);
        res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
};

exports.createSupplier = async (req, res) => {
    const nom = normalizeString(req.body.nom);
    if (!nom) {
        return res.status(400).json({ error: 'Supplier name (nom) is required' });
    }

    const contactNom = normalizeString(req.body.contactNom);
    const telephone = normalizeString(req.body.telephone);
    const email = normalizeString(req.body.email);
    const adresse = normalizeString(req.body.adresse);

    try {
        const text = `
            INSERT INTO fournisseur (nom, contactNom, telephone, email, adresse)
            VALUES (?, ?, ?, ?, ?);
        `;
        const values = [nom, contactNom, telephone, email, adresse];
        const [result] = await db.query(text, values);
        res.status(201).json({ id: result.insertId, msg: 'Supplier created successfully' });
    } catch (err) {
        console.error('Error creating supplier:', err.message);
        res.status(500).json({ error: 'Failed to create supplier' });
    }
};

exports.updateSupplier = async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Invalid supplier id' });
    }

    const nom = normalizeString(req.body.nom);
    if (!nom) {
        return res.status(400).json({ error: 'Supplier name (nom) is required' });
    }

    const contactNom = normalizeString(req.body.contactNom);
    const telephone = normalizeString(req.body.telephone);
    const email = normalizeString(req.body.email);
    const adresse = normalizeString(req.body.adresse);

    try {
        const existing = await fetchSupplier(id);
        if (!existing) {
            return res.status(404).json({ error: 'Supplier not found' });
        }

        const text = `
            UPDATE fournisseur
            SET nom = ?, contactNom = ?, telephone = ?, email = ?, adresse = ?
            WHERE id = ?;
        `;
        const values = [nom, contactNom, telephone, email, adresse, id];
        await db.query(text, values);

        res.status(200).json({ msg: 'Supplier updated successfully' });
    } catch (err) {
        console.error('Error updating supplier:', err.message);
        res.status(500).json({ error: 'Failed to update supplier' });
    }
};

exports.deleteSupplier = async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'Invalid supplier id' });
    }

    try {
        const existing = await fetchSupplier(id);
        if (!existing) {
            return res.status(404).json({ error: 'Supplier not found' });
        }

        await db.query('DELETE FROM fournisseur WHERE id = ?', [id]);
        res.status(200).json({ msg: 'Supplier deleted successfully' });
    } catch (err) {
        console.error('Error deleting supplier:', err.message);
        res.status(500).json({ error: 'Failed to delete supplier' });
    }
};
