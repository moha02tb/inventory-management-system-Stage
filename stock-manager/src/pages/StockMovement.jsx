import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../api/productApi";
import { getSuppliers } from "../api/supplierApi";
import { getStockMovements, addStockMovement } from "../api/movementApi";

const StockMovement = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [supplierId, setSupplierId] = useState("");
    const [suppliers, setSuppliers] = useState([]);
    const [quantity, setQuantity] = useState(0);
    const [raison, setRaison] = useState("");
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [productsData, movementsData, suppliersData] = await Promise.all([
                getProducts(),
                getStockMovements(),
                getSuppliers(),
            ]);
            setProducts(productsData);
            setMovements(movementsData);
            setSuppliers(suppliersData);
        } catch (error) {
            console.error("Failed to load stock data:", error);
            alert(error?.response?.data?.msg || "Failed to load stock data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const stats = useMemo(() => {
        const totalIn = movements
            .filter((m) => m.type === "IN")
            .reduce((acc, cur) => acc + Number(cur.quantité ?? cur.quantitAc ?? 0), 0);
        const totalOut = movements
            .filter((m) => m.type === "OUT")
            .reduce((acc, cur) => acc + Number(cur.quantité ?? cur.quantitAc ?? 0), 0);
        const last = movements[0];
        return { totalIn, totalOut, last };
    }, [movements]);

    const handleRecordMovement = async (type) => {
        if (!selectedProduct || quantity <= 0) {
            return alert("Select a product and enter a positive quantity.");
        }

        // If the product has a supplier, lock to it; otherwise require a selection
        const product = products.find((p) => `${p.id}` === `${selectedProduct}`);
        const finalSupplierId = product?.fournisseurId ?? supplierId;
        if (!finalSupplierId) {
            return alert("Select a supplier for this movement.");
        }

        setSubmitting(true);
        try {
            await addStockMovement({
                produitId: selectedProduct,
                type: type === "add" ? "IN" : "OUT",
                quantité: Number(quantity),
                raison: raison || (type === "add" ? "Reception" : "Sale/Disposal"),
                fournisseurId: finalSupplierId,
            });
            await loadData();
            setSelectedProduct("");
            setSupplierId("");
            setQuantity(0);
            setRaison("");
        } catch (error) {
            const msg =
                error?.response?.data?.error ||
                error?.response?.data?.msg ||
                error?.message ||
                "Failed to record movement.";
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-6">Loading stock management data...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Admin</p>
                    <h1 className="text-3xl font-semibold text-slate-900">Stock Movements</h1>
                    <p className="text-sm text-slate-600">Record and audit inventory movements with supplier context.</p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-2 text-amber-700 text-sm">
                    <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" />
                    Admin-only access
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Total IN</p>
                    <p className="mt-1 text-2xl font-semibold text-emerald-700">+{stats.totalIn}</p>
                    <p className="text-xs text-slate-500">Units received</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Total OUT</p>
                    <p className="mt-1 text-2xl font-semibold text-rose-700">-{stats.totalOut}</p>
                    <p className="text-xs text-slate-500">Units dispatched</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Last movement</p>
                    {stats.last ? (
                        <div className="mt-1 text-sm text-slate-700">
                            <div className="font-semibold">
                                {stats.last.produitNom} / {stats.last.type} / {stats.last.quantité ?? stats.last.quantitAc}
                            </div>
                            <div className="text-slate-500">
                                {new Date(stats.last.date).toLocaleString()}
                            </div>
                        </div>
                    ) : (
                        <p className="mt-1 text-sm text-slate-500">No movements yet</p>
                    )}
                </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[220px]">
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Product</label>
                        <select
                            value={selectedProduct}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSelectedProduct(val);
                                const prod = products.find((p) => `${p.id}` === `${val}`);
                                setSupplierId(prod?.fournisseurId ?? "");
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner shadow-slate-900/5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">Select product</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.nom} / Stock: {p.quantité ?? p.quantitAc} {p.fournisseurNom ? ` / ${p.fournisseurNom}` : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Supplier</label>
                        <select
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner shadow-slate-900/5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">Select supplier</option>
                            {suppliers.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.nom} {s.contactNom ? `(${s.contactNom})` : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-32">
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Quantity</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner shadow-slate-900/5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Reason</label>
                        <input
                            type="text"
                            placeholder="Reception, Return, Adjustment..."
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner shadow-slate-900/5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            value={raison}
                            onChange={(e) => setRaison(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleRecordMovement("add")}
                            disabled={submitting}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition hover:translate-y-px hover:shadow-lg disabled:opacity-50"
                        >
                            Add (IN)
                        </button>
                        <button
                            onClick={() => handleRecordMovement("remove")}
                            disabled={submitting}
                            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/20 transition hover:translate-y-px hover:shadow-lg disabled:opacity-50"
                        >
                            Remove (OUT)
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">History</p>
                        <h3 className="text-lg font-semibold text-slate-900">Movement log ({movements.length})</h3>
                    </div>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-3 py-1">
                        Supplier required when configured
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Product</th>
                                <th className="px-4 py-3 text-left font-semibold">Type</th>
                                <th className="px-4 py-3 text-left font-semibold">Quantity</th>
                                <th className="px-4 py-3 text-left font-semibold">Supplier</th>
                                <th className="px-4 py-3 text-left font-semibold">User</th>
                                <th className="px-4 py-3 text-left font-semibold">Reason</th>
                                <th className="px-4 py-3 text-left font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movements.map((m) => (
                                <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                                    <td className="px-4 py-3 font-semibold text-slate-900">{m.produitNom}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                m.type === "IN"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-rose-50 text-rose-700"
                                            }`}
                                        >
                                            {m.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{m.quantité ?? m.quantitAc}</td>
                                    <td className="px-4 py-3 text-slate-700">
                                        {m.fournisseurNom || m.fournisseurId || <span className="text-slate-400">N/A</span>}
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">{m.utilisateurNom}</td>
                                    <td className="px-4 py-3 text-slate-600">{m.raison}</td>
                                    <td className="px-4 py-3 text-slate-600">
                                        {m.date ? new Date(m.date).toLocaleString() : "-"}
                                    </td>
                                </tr>
                            ))}
                            {movements.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-4 py-6 text-center text-slate-500">
                                        No movements recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StockMovement;
