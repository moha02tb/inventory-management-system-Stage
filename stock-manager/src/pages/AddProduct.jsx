import React, { useState, useEffect } from "react";
import { addProduct, getCategories } from "../api/productApi";
import { getSuppliers } from "../api/supplierApi";
import { useNavigate } from "react-router-dom";

const INITIAL_PRODUCT_STATE = {
    nom: "",
    categorieId: "",
    quantité: 0,
    prix: 0,
    lowStockAlert: 10,
    minStock: 1,
    maxStock: 999,
    fournisseurId: "",
};

const AddProduct = () => {
    const navigate = useNavigate();
    const [product, setProduct] = useState(INITIAL_PRODUCT_STATE);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cats, supps] = await Promise.all([getCategories(), getSuppliers()]);
                setCategories(cats);
                setSuppliers(supps);
            } catch (err) {
                console.error("Error loading form data:", err);
                setError("Failed to load categories or suppliers.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const numericFields = ["categorieId", "quantité", "prix", "lowStockAlert", "minStock", "maxStock", "fournisseurId"];
        const parsedValue = numericFields.includes(name)
            ? (type === "number" ? Number(value) : Number(value) || 0)
            : value;
        setProduct((prev) => ({ ...prev, [name]: parsedValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!product.nom.trim() || !product.categorieId || !product.fournisseurId) {
            return alert("Product name, category, and supplier are required.");
        }
        try {
            await addProduct({ ...product, quantité: Number(product.quantité) });
            alert("Product added successfully!");
            setProduct(INITIAL_PRODUCT_STATE);
            navigate("/products");
        } catch (error) {
            console.error("Submit Error:", error.response || error);
            const status = error.response?.status;
            if (status === 403) {
                alert("Failed to add product. Admin permissions required.");
            } else {
                const msg = error.response?.data?.msg || error.response?.data?.error || "An unexpected error occurred.";
                alert(`Failed to add product: ${msg}`);
            }
        }
    };

    const getFieldValue = (field) => (product[field] === 0 ? "" : product[field]);

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading form...</div>;
    }
    if (error) {
        return <div className="p-6 text-center text-red-600">{error}</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-center">
                <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white shadow p-6 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Add New Product</h1>
                        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full">
                            Supplier required
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input
                                name="nom"
                                placeholder="e.g., iPhone 15 Pro"
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                onChange={handleChange}
                                value={product.nom}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                name="categorieId"
                                className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
                                onChange={handleChange}
                                value={product.categorieId}
                                required
                            >
                                <option value="">-- Select Category --</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name || category.nom}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                            <select
                                name="fournisseurId"
                                className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
                                onChange={handleChange}
                                value={product.fournisseurId}
                                required
                            >
                                <option value="">-- Select Supplier --</option>
                                {suppliers.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.nom} {s.contactNom ? `(${s.contactNom})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Quantity</label>
                            <input
                                type="number"
                                name="quantité"
                                min="0"
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                onChange={handleChange}
                                value={getFieldValue("quantité")}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                            <input
                                type="number"
                                name="prix"
                                min="0"
                                step="0.01"
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                onChange={handleChange}
                                value={getFieldValue("prix")}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert</label>
                            <input
                                type="number"
                                name="lowStockAlert"
                                min="0"
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                onChange={handleChange}
                                value={getFieldValue("lowStockAlert")}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock</label>
                            <input
                                type="number"
                                name="minStock"
                                min="0"
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                onChange={handleChange}
                                value={getFieldValue("minStock")}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Stock</label>
                            <input
                                type="number"
                                name="maxStock"
                                min="0"
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                onChange={handleChange}
                                value={getFieldValue("maxStock")}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white p-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition"
                    >
                        Save Product
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
