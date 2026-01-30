import { useEffect, useState } from "react";
import API_URL from "../config";

const IssuesReport = () => {
    const [issuesList, setIssuesList] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        loadAllIssues();
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/products`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Failed to load products:", error);
        }
    };

    const loadAllIssues = async () => {
        try {
            const response = await fetch(`${API_URL}/issues/admin/report`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                setIssuesList(data);
            } else {
                console.error("Failed to load issues report:", response.status);
            }
        } catch (error) {
            console.error("Failed to load issues report:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (issueId, newStatus) => {
        try {
            const response = await fetch(`${API_URL}/issues/${issueId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                alert("Issue status updated!");
                loadAllIssues();
            } else {
                const error = await response.json();
                console.error("Failed to update issue:", error);
                alert("Failed to update issue status: " + (error.msg || "Unknown error"));
            }
        } catch (error) {
            console.error("Error updating issue:", error);
            alert("Failed to update issue status: " + error.message);
        }
    };

    const getFilteredIssues = () => {
        if (filterStatus === "all") return issuesList;
        return issuesList.filter(issue => issue.status === filterStatus);
    };

    if (loading) return <div className="p-6 text-center">Loading...</div>;

    const filteredIssues = getFilteredIssues();
    const stats = {
        pending: issuesList.filter(i => i.status === 'pending').length,
        inProgress: issuesList.filter(i => i.status === 'in_progress').length,
        resolved: issuesList.filter(i => i.status === 'resolved').length
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">⚠️ Issues & Reports Management</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-yellow-100 p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-lg">Pending</h3>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-lg">In Progress</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-lg">Resolved</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <label className="block text-sm font-semibold mb-2">Filter by Status</label>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full p-2 border rounded"
                >
                    <option value="all">All Issues</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>
            </div>

            {/* Issues List */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">All Issues</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="p-2 border">Product</th>
                                <th className="p-2 border">Issue Type</th>
                                <th className="p-2 border">Damaged Pieces</th>
                                <th className="p-2 border">Description</th>
                                <th className="p-2 border">Reported By</th>
                                <th className="p-2 border">Date</th>
                                <th className="p-2 border">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredIssues.length > 0 ? (
                                filteredIssues.map((issue) => {
                                    const product = products.find(p => p.id === issue.produitId);
                                    return (
                                        <tr key={issue.id}>
                                            <td className="p-2 border">{product ? product.nom : 'Unknown'}</td>
                                            <td className="p-2 border capitalize">{issue.type.replace('_', ' ')}</td>
                                            <td className="p-2 border text-center font-semibold">{issue.damagedPieces || 0}</td>
                                            <td className="p-2 border">{issue.description}</td>
                                            <td className="p-2 border">{issue.reportedBy}</td>
                                            <td className="p-2 border">{new Date(issue.createdAt).toLocaleDateString()}</td>
                                            <td className="p-2 border">
                                                <select
                                                    value={issue.status}
                                                    onChange={(e) => handleUpdateStatus(issue.id, e.target.value)}
                                                    className={`p-1 rounded text-white font-semibold ${
                                                        issue.status === 'resolved' ? 'bg-green-600' :
                                                        issue.status === 'pending' ? 'bg-yellow-600' : 'bg-blue-600'
                                                    }`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="resolved">Resolved</option>
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-2 border text-center">No issues found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default IssuesReport;
