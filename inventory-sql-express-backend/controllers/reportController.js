const db = require("../config/db");

exports.getSalesReport = async (req, res) => {
    const { from, to } = req.query;

    let where = " WHERE 1=1 ";
    let params = [];

    // DATE FILTERING
    if (from) {
        where += " AND v.date >= ? ";
        params.push(from + " 00:00:00");
    }
    if (to) {
        where += " AND v.date <= ? ";
        params.push(to + " 23:59:59");
    }

    try {
        // ============================
        // EMPLOYEE STATS (FOR DROPDOWN)
        // ============================
        const statsSql = `
            SELECT 
                u.id AS utilisateurId,
                u.nom AS employeeName,
                COUNT(v.id) AS salesCount,
                SUM(v.quantité) AS totalSales,
                SUM(v.prixTotal) AS totalRevenue
            FROM vente v
            JOIN utilisateur u ON v.utilisateurId = u.id
            ${where}
            GROUP BY u.id, u.nom
            ORDER BY employeeName ASC;
        `;

        const [stats] = await db.query(statsSql, params);

        // ============================
        // FULL SALES LIST
        // ============================
        const salesSql = `
            SELECT 
                v.id,
                v.quantité,
                v.prixTotal,
                v.date,
                u.nom AS employeeName,
                p.nom AS productName
            FROM vente v
            JOIN utilisateur u ON v.utilisateurId = u.id
            JOIN produit p ON v.produitId = p.id
            ${where}
            ORDER BY v.date DESC;
        `;

        const [sales] = await db.query(salesSql, params);

        res.status(200).json({ stats, sales });

    } catch (err) {
        console.error("Error generating sales report:", err);
        res.status(500).json({ error: "Failed to generate sales report." });
    }
};
