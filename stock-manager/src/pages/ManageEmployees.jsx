import { useEffect, useState } from "react";
import API_URL from "../config";

const ManageEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        nom: "",
        email: "",
        motDePasse: "",
        role: "employee",
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        try {
            const response = await fetch(`${API_URL}/auth/employees`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (response.ok) {
                const data = await response.json();
                setEmployees(data);
            }
        } catch (error) {
            console.error("Failed to load employees:", error);
            setError("Failed to load employees");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.nom || !formData.email || (!editingId && !formData.motDePasse)) {
            setError("All fields are required");
            return;
        }

        try {
            const method = editingId ? "PUT" : "POST";
            const url = editingId
                ? `${API_URL}/auth/employees/${editingId}`
                : `${API_URL}/auth/employees`;

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSuccess(editingId ? "Employee updated successfully!" : "Employee created successfully!");
                setFormData({ nom: "", email: "", motDePasse: "", role: "employee" });
                setEditingId(null);
                setShowForm(false);
                loadEmployees();
            } else {
                const error = await response.json();
                setError(error.msg || "Failed to save employee");
            }
        } catch (error) {
            console.error("Error saving employee:", error);
            setError("Error saving employee: " + error.message);
        }
    };

    const handleEdit = (employee) => {
        setFormData({
            nom: employee.nom,
            email: employee.email,
            motDePasse: "",
            role: employee.role,
        });
        setEditingId(employee.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this employee?")) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/employees/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            if (response.ok) {
                setSuccess("Employee deleted successfully!");
                loadEmployees();
            } else {
                const error = await response.json();
                setError(error.msg || "Failed to delete employee");
            }
        } catch (error) {
            console.error("Error deleting employee:", error);
            setError("Error deleting employee: " + error.message);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ nom: "", email: "", motDePasse: "", role: "employee" });
        setError("");
    };

    if (loading) return <div className="p-6 text-center">Loading employees...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Manage Employees</h1>
                    <p className="text-slate-600 mt-1">
                        Add, edit, and manage staff access for your inventory system.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                    Add Employee
                </button>
            </div>

            {/* Error/Success Messages */}
            {(error || success) && (
                <div
                    className={`px-4 py-3 rounded-lg border ${
                        error
                            ? "bg-rose-50 border-rose-200 text-rose-700"
                            : "bg-emerald-50 border-emerald-200 text-emerald-700"
                    }`}
                >
                    {error || success}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {showForm && (
                    <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    {editingId ? "Edit Employee" : "Add New Employee"}
                                </h2>
                                <p className="text-sm text-slate-500">
                                    {editingId ? "Update user details." : "Create a new user account."}
                                </p>
                            </div>
                            <button
                                onClick={handleCancel}
                                className="text-xs text-slate-500 hover:text-slate-700"
                            >
                                Close
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                                <input
                                    type="text"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Employee name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="employee@example.com"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">
                                    {editingId ? "Password (leave empty to keep current)" : "Password"}
                                </label>
                                <input
                                    type="password"
                                    name="motDePasse"
                                    value={formData.motDePasse}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Password"
                                    required={!editingId}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="employee">Employee</option>
                                    <option value="staff">Staff</option>
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                                >
                                    {editingId ? "Update Employee" : "Add Employee"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 bg-slate-200 text-slate-800 py-2 rounded-lg font-semibold hover:bg-slate-300 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className={`${showForm ? "lg:col-span-2" : "lg:col-span-3"} bg-white border border-slate-200 rounded-xl shadow-sm`}>
                    <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Employees</h2>
                            <p className="text-sm text-slate-500">All staff accounts and roles.</p>
                        </div>
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                            Total: {employees.length}
                        </span>
                    </div>

                    {/* Table view for md+ */}
                    <div className="hidden md:block overflow-auto">
                        <table className="min-w-full text-sm text-slate-800">
                            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.length > 0 ? (
                                    employees.map((employee, idx) => {
                                        const rowBg = idx % 2 === 0 ? "bg-white" : "bg-slate-50";
                                        return (
                                            <tr key={employee.id} className={rowBg}>
                                                <td className="px-4 py-3 font-medium">{employee.id}</td>
                                                <td className="px-4 py-3">{employee.nom}</td>
                                                <td className="px-4 py-3 text-slate-700">{employee.email}</td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                            employee.role === "admin"
                                                                ? "bg-red-100 text-red-700"
                                                                : employee.role === "staff"
                                                                ? "bg-purple-100 text-purple-700"
                                                                : "bg-blue-100 text-blue-700"
                                                        }`}
                                                    >
                                                        {employee.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(employee)}
                                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(employee.id)}
                                                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                                        disabled={employee.role === "admin"}
                                                        title={employee.role === "admin" ? "Cannot delete admin" : "Delete"}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-6 text-center text-slate-500">
                                            No employees found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Card view for mobile */}
                    <div className="md:hidden p-4 grid gap-4">
                        {employees.length > 0 ? (
                            employees.map((employee) => (
                                <div key={employee.id} className="border border-slate-200 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className="font-semibold text-slate-900">{employee.nom}</div>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                employee.role === "admin"
                                                    ? "bg-red-100 text-red-700"
                                                    : employee.role === "staff"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-blue-100 text-blue-700"
                                            }`}
                                        >
                                            {employee.role}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-700">{employee.email}</div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(employee)}
                                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(employee.id)}
                                            className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                            disabled={employee.role === "admin"}
                                            title={employee.role === "admin" ? "Cannot delete admin" : "Delete"}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-slate-500 text-sm">No employees found</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageEmployees;
