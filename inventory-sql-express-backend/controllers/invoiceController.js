const db = require('../config/db');
const PDFDocument = require('pdfkit');

// Ensure invoice table exists (LONGBLOB storage)
const ensureTable = async () => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS facture (
            id INT AUTO_INCREMENT PRIMARY KEY,
            saleId INT NOT NULL,
            filename VARCHAR(255) NOT NULL,
            mime VARCHAR(64) NOT NULL DEFAULT 'application/pdf',
            size INT NOT NULL,
            data LONGBLOB NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX sale_idx (saleId)
        );
    `);
};

const buildPdfBuffer = (invoice) => new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text('Invoice', { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(`Invoice ID: pending (sale ${invoice.saleId})`);
    doc.text(`Sale ID: ${invoice.saleId}`);
    doc.text(`Date: ${invoice.date}`);
    doc.text(`Employee: ${invoice.employeeName || 'N/A'}`);
    doc.moveDown();

    doc.text(`Product: ${invoice.productName || 'N/A'}`);
    doc.text(`Quantity: ${invoice.quantity}`);
    doc.text(`Unit Price: ${invoice.unitPrice.toFixed(2)}`);
    doc.text(`Total: ${invoice.total.toFixed(2)}`);

    doc.end();
});

exports.createInvoiceForSale = async (req, res) => {
    try {
        const saleId = Number(req.params.saleId || req.body.saleId);
        if (!saleId) {
            return res.status(400).json({ msg: 'saleId is required' });
        }

        await ensureTable();

        const [sales] = await db.query(
            `SELECT v.id, v.produitId, v.utilisateurId,
                    v.\`quantité\` AS quantity,
                    v.prixTotal, v.date,
                    p.nom AS productName, p.prix AS productPrice,
                    u.nom AS employeeName
             FROM vente v
             JOIN produit p ON v.produitId = p.id
             LEFT JOIN utilisateur u ON v.utilisateurId = u.id
             WHERE v.id = ?
             LIMIT 1`,
            [saleId]
        );

        if (sales.length === 0) {
            return res.status(404).json({ msg: 'Sale not found' });
        }

        const sale = sales[0];
        const quantity = Number(sale.quantity || 0);
        const unitPrice = Number(sale.productPrice || 0);
        const total = sale.prixTotal ? Number(sale.prixTotal) : unitPrice * quantity;
        const invoiceDate = sale.date ? new Date(sale.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

        const pdfBuffer = await buildPdfBuffer({
            saleId,
            productName: sale.productName,
            quantity,
            unitPrice,
            total,
            employeeName: sale.employeeName,
            date: invoiceDate,
        });

        const filename = `invoice-${saleId}-${Date.now()}.pdf`;

        const [result] = await db.query(
            `INSERT INTO facture (saleId, filename, mime, size, data)
             VALUES (?, ?, 'application/pdf', ?, ?)`
            , [saleId, filename, pdfBuffer.length, pdfBuffer]
        );

        res.status(201).json({
            id: result.insertId,
            saleId,
            filename,
            size: pdfBuffer.length,
            mime: 'application/pdf',
        });
    } catch (err) {
        console.error('Invoice creation failed:', err.message);
        return res.status(500).json({ msg: 'Failed to create invoice', error: err.message });
    }
};

const sendInvoice = (res, row) => {
    res.setHeader('Content-Type', row.mime || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${row.filename}"`);
    res.setHeader('Content-Length', row.size);
    return res.send(row.data);
};

exports.getInvoiceById = async (req, res) => {
    await ensureTable();
    const invoiceId = Number(req.params.id);
    const [rows] = await db.query('SELECT * FROM facture WHERE id = ? LIMIT 1', [invoiceId]);
    if (rows.length === 0) return res.status(404).json({ msg: 'Invoice not found' });
    return sendInvoice(res, rows[0]);
};

exports.getInvoiceBySale = async (req, res) => {
    await ensureTable();
    const saleId = Number(req.params.saleId);
    const [rows] = await db.query('SELECT * FROM facture WHERE saleId = ? ORDER BY id DESC LIMIT 1', [saleId]);
    if (rows.length === 0) return res.status(404).json({ msg: 'Invoice not found for sale' });
    return sendInvoice(res, rows[0]);
};
