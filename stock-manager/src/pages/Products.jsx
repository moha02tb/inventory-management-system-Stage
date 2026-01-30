import { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../api/productApi";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Products = () => {
    const [products, setProducts] = useState([]);
    const { isAdmin } = useAuth();

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setProducts(await getProducts());
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteProduct(id);
                loadProducts();
            } catch (error) {
                alert("Deletion failed: Check console for details.");
            }
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Catalog</p>
                    <h1 className="text-3xl font-semibold text-slate-900">Products</h1>
                    <p className="text-sm text-slate-500">Current inventory with category, stock, and thresholds.</p>
                </div>
                <Link
                    to="/products/add"
                    className="rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:translate-y-px hover:shadow-xl"
                >
                    Add product
                </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50/80 backdrop-blur">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Category
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Stock
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Min stock
                            </th>
                            {isAdmin && (
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {products.map((p) => {
                            const qty = Number(p.quantité ?? p.quantitAc ?? 0);
                            const isLow = qty < Number(p.lowStockAlert);
                            return (
                                <tr key={p.id} className="transition hover:bg-slate-50/70">
                                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                                        <div className="flex items-center gap-2">
                                            <span>{p.nom}</span>
                                            {isLow && (
                                                <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase text-amber-800">
                                                    Low
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500">ID: {p.id}</p>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-700">{p.categorieNom}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">{p.quantité ?? p.quantitAc}</td>
                                    <td className="px-4 py-3 text-sm text-slate-700">{p.lowStockAlert}</td>
                                    {isAdmin && (
                                        <td className="px-4 py-3 text-right text-sm font-medium text-slate-600">
                                            <Link
                                                to={`/products/edit/${p.id}`}
                                                className="mr-3 rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-800 transition hover:bg-slate-900/10"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={isAdmin ? 5 : 4} className="px-4 py-6 text-center text-sm text-slate-500">
                                    No products found. Add your first product to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Products;
