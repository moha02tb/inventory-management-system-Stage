import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, updateProduct, getCategories } from "../api/productApi";
import { getSuppliers } from "../api/supplierApi";

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState({
        nom: "",
        categorieId: "",
        quantité: 0,
        prix: 0,
        lowStockAlert: 10,
        minStock: 1,
        maxStock: 999,
        fournisseurId: "",
    });
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [data, cats, supps] = await Promise.all([
                    getProductById(id),
                    getCategories(),
                    getSuppliers(),
                ]);
                setProduct({
                    nom: data.nom || "",
                    categorieId: data.categorieId || "",
                    quantité: Number(data["quantité"] ?? data.quantitAc ?? 0),
                    prix: Number(data.prix) || 0,
                    lowStockAlert: Number(data.lowStockAlert) || 10,
                    minStock: Number(data.minStock) || 1,
                    maxStock: Number(data.maxStock) || 999,
                    fournisseurId: data.fournisseurId || "",
                });
                setCategories(cats);
                setSuppliers(supps);
            } catch (error) {
                console.error("Error loading product:", error);
                alert("Failed to load product data.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const numericFields = ["categorieId", "quantité", "prix", "lowStockAlert", "minStock", "maxStock", "fournisseurId"];
        const parsedValue = numericFields.includes(name)
            ? (type === "number" ? Number(value) : Number(value) || 0)
            : value;
        setProduct((prev) => ({ ...prev, [name]: parsedValue }));
    };

    const handleSave = async () => {
        try {
            await updateProduct(id, product);
            alert("Changes saved successfully!");
            navigate("/products");
        } catch (error) {
            const msg = error?.response?.data?.error || error?.response?.data?.msg || "Failed to save changes.";
            alert(msg);
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading product data...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-center">
                <div className="w-full max-w-2xl bg-white p-6 shadow rounded-xl space-y-4">
                    <h1 className="text-xl font-bold mb-2">Edit Product ID: {id}</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input
                                name="nom"
                                value={product.nom}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                                placeholder="Product name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                name="categorieId"
                                value={product.categorieId}
                                onChange={handleChange}
                                className="w-full border p-2 rounded bg-white"
                            >
                                <option value="">Select category</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nom || c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                            <select
                                name="fournisseurId"
                                value={product.fournisseurId}
                                onChange={handleChange}
                                className="w-full border p-2 rounded bg-white"
                            >
                                <option value="">Select supplier</option>
                                {suppliers.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.nom} {s.contactNom ? `(${s.contactNom})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                                type="number"
                                name="quantité"
                                value={product.quantité}
                                onChange={handleChange}
                                className="w-full border p-2 rounded bg-gray-50"
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                            <input
                                type="number"
                                name="prix"
                                value={product.prix}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                                placeholder="Price"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert</label>
                            <input
                                type="number"
                                name="lowStockAlert"
                                value={product.lowStockAlert}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock</label>
                            <input
                                type="number"
                                name="minStock"
                                value={product.minStock}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Stock</label>
                            <input
                                type="number"
                                name="maxStock"
                                value={product.maxStock}
                                onChange={handleChange}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;
