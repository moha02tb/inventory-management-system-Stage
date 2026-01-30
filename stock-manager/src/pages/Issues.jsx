import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getIssues, addIssue } from "../api/issuesApi";
import { getProducts } from "../api/productApi";

const statusBadge = (status) => {
    switch (status) {
        case "resolved":
            return "bg-emerald-100 text-emerald-700";
        case "pending":
            return "bg-amber-100 text-amber-700";
        default:
            return "bg-blue-100 text-blue-700";
    }
};

const typeBadge = (type) => {
    switch (type) {
        case "mal_fabrication":
            return "bg-purple-100 text-purple-700";
        case "stock_issue":
            return "bg-sky-100 text-sky-700";
        case "equipment_damage":
            return "bg-rose-100 text-rose-700";
        default:
            return "bg-slate-100 text-slate-700";
    }
};

const Issues = () => {
    const [issueType, setIssueType] = useState("mal_fabrication");
    const [description, setDescription] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");
    const [damagedPieces, setDamagedPieces] = useState(0);
    const [products, setProducts] = useState([]);
    const [issuesList, setIssuesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const { role } = useAuth();

    useEffect(() => {
        loadIssues();
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error("Failed to load products:", error);
        }
    };

    const loadIssues = async () => {
        try {
            const data = await getIssues();
            setIssuesList(data);
        } catch (error) {
            console.error("Failed to load issues:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReportIssue = async (e) => {
        e.preventDefault();

        if (!description.trim() || !selectedProduct) {
            alert("Please select a product and describe the issue.");
            return;
        }

        try {
            await addIssue({
                type: issueType,
                description: description,
                produitId: Number(selectedProduct),
                damagedPieces: Number(damagedPieces),
                reportedBy: role,
                status: "pending",
            });

            alert("Issue reported successfully!");
            setDescription("");
            setSelectedProduct("");
            setDamagedPieces(0);
            setIssueType("mal_fabrication");
            loadIssues();
        } catch (error) {
            console.error("Error reporting issue:", error);
            alert("Failed to report issue. Check console for details.");
        }
    };

    if (loading) return <div className="p-6 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Report Issues</h1>
                    <p className="text-slate-600 mt-1">
                        Log product or equipment issues and track their status in one place.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4">
                        <h2 className="text-lg font-semibold text-slate-900">Report an Issue</h2>
                        <p className="text-sm text-slate-500">Provide details so the team can resolve it quickly.</p>
                    </div>
                    <form onSubmit={handleReportIssue} className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Product with Issue</label>
                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">-- Select Product --</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.nom} (Stock: {product.quantité ?? product.quantitAc})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Issue Type</label>
                            <select
                                value={issueType}
                                onChange={(e) => setIssueType(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="mal_fabrication">Mal Fabrication</option>
                                <option value="stock_issue">Stock Issue</option>
                                <option value="equipment_damage">Equipment Damage</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Damaged Pieces</label>
                            <input
                                type="number"
                                min="0"
                                value={damagedPieces}
                                onChange={(e) => setDamagedPieces(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Number of damaged pieces"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="5"
                                placeholder="Describe the issue in detail..."
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            Submit Issue
                        </button>
                    </form>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">My Reported Issues</h2>
                            <p className="text-sm text-slate-500">Keep track of progress and resolutions.</p>
                        </div>
                        <div className="flex gap-2 text-xs">
                            <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                                Pending: {issuesList.filter((i) => i.status === "pending").length}
                            </span>
                            <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                Resolved: {issuesList.filter((i) => i.status === "resolved").length}
                            </span>
                        </div>
                    </div>

                    {/* Table for md+ screens */}
                    <div className="hidden md:block overflow-auto">
                        <table className="min-w-full text-sm text-slate-800">
                            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Product</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Damaged</th>
                                    <th className="px-4 py-3">Description</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {issuesList.length > 0 ? (
                                    issuesList.map((issue, idx) => {
                                        const product = products.find((p) => p.id === issue.produitId);
                                        const rowBg = idx % 2 === 0 ? "bg-white" : "bg-slate-50";
                                        return (
                                            <tr key={issue.id} className={rowBg}>
                                                <td className="px-4 py-3 font-medium">{product ? product.nom : "Unknown"}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${typeBadge(issue.type)}`}>
                                                        {issue.type.replace("_", " ")}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center font-semibold">{issue.damagedPieces || 0}</td>
                                                <td className="px-4 py-3 text-slate-700">{issue.description}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(issue.status)}`}>
                                                        {issue.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {new Date(issue.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-6 text-center text-slate-500">
                                            No issues reported yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Card list for mobile */}
                    <div className="md:hidden p-4 grid gap-4">
                        {issuesList.length > 0 ? (
                            issuesList.map((issue) => {
                                const product = products.find((p) => p.id === issue.produitId);
                                return (
                                    <div key={issue.id} className="border border-slate-200 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <div className="font-semibold text-slate-900">{product ? product.nom : "Unknown"}</div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(issue.status)}`}>
                                                {issue.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <span className={`px-2 py-1 rounded-full font-semibold ${typeBadge(issue.type)}`}>
                                                {issue.type.replace("_", " ")}
                                            </span>
                                            <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                                                Damaged: {issue.damagedPieces || 0}
                                            </span>
                                            <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                                                {new Date(issue.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-slate-700 text-sm">{issue.description}</p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center text-slate-500 text-sm">No issues reported yet</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Issues;
