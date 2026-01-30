import { useEffect, useState } from "react";
import API_URL from "../config";

const SalesReport = () => {
    const [salesData, setSalesData] = useState([]);
    const [employeeStats, setEmployeeStats] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterEmployee, setFilterEmployee] = useState("all"); // stores utilisateurId or 'all'
    const [filterDateFrom, setFilterDateFrom] = useState("");
    const [filterDateTo, setFilterDateTo] = useState("");

    const handleInvoice = async (saleId, action = 'download') => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/invoices/by-sale/${saleId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                return alert('Invoice not available for this sale yet.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            if (action === 'print') {
                const win = window.open(url, '_blank');
                if (win) {
                    win.addEventListener('load', () => {
                        win.focus();
                        win.print();
                    });
                }
            } else {
                const a = document.createElement('a');
                a.href = url;
                a.download = `invoice-${saleId}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        } catch (err) {
            console.error('Failed to fetch invoice', err);
            alert('Failed to download invoice.');
        }
    };

    useEffect(() => {
        loadSalesReport();
    }, []);

    const loadSalesReport = async () => {
        try {
            const response = await fetch(`${API_URL}/sales/admin/report`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (response.ok) {
                const data = await response.json();

                // Normalize sales entries for consistent keys
                const normalizedSales = (data.sales || []).map((sale) => ({
                    ...sale,
                    quantity: sale.quantitAc ?? sale['quantité'] ?? 0,
                    dateValue: sale.date,
                }));

                setSalesData(normalizedSales);
                setEmployeeStats(data.stats || []);
            }
        } catch (error) {
            console.error("Failed to load sales report:", error);
        } finally {
            setLoading(false);
        }
    };

   const getFilteredSales = () => {
    const parseSaleDate = (value) => {
        if (!value) return null;
        const normalized = typeof value === 'string' ? value.replace(' ', 'T') : value;
        const parsed = new Date(normalized);
        return isNaN(parsed.getTime()) ? null : parsed;
    };

    const filterEmployeeId = filterEmployee === 'all' ? null : Number(filterEmployee);

    return salesData.filter((sale) => {
        const saleEmployeeId = sale.utilisateurId || sale.employeeId; // backend may send either name or id
        const empSale = (sale.employeeName || sale.employeeFullName || '').trim().toLowerCase();
        const empFilterName = (filterEmployee || '').trim().toLowerCase();

        const matchEmployee =
            filterEmployee === 'all' ||
            (Number(saleEmployeeId) === filterEmployeeId) ||
            (empSale && empSale === empFilterName);

        const saleDate = parseSaleDate(sale.dateValue || sale.date);

        if ((filterDateFrom || filterDateTo) && !saleDate) {
            return false;
        }

        // Compare by local date-only string to align with <input type="date"> values
        const saleDateLocal = saleDate
            ? saleDate.toLocaleDateString('en-CA') // YYYY-MM-DD in local timezone
            : null;

        const matchDateFrom =
            !filterDateFrom || (saleDateLocal && saleDateLocal >= filterDateFrom);

        const matchDateTo =
            !filterDateTo || (saleDateLocal && saleDateLocal <= filterDateTo);

        return matchEmployee && matchDateFrom && matchDateTo;
    });
};

    const getTotalSales = (filtered) => {
        return filtered.reduce(
            (sum, sale) => sum + (sale.quantity || sale.quantitAc || sale['quantité'] || 0),
            0
        );
    };

    if (loading) return <div className="p-6 text-center">Loading...</div>;

    const filteredSales = getFilteredSales();
    const totalQuantity = getTotalSales(filteredSales);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Sales Report</h1>

            {/* Employee Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {employeeStats.map((emp) => (
                    <div
                        key={emp.utilisateurId}
                        className="bg-blue-100 p-4 rounded-lg shadow"
                    >
                        <h3 className="font-semibold text-lg">
                            {emp.employeeName || "Unknown"}
                        </h3>
                        <p className="text-2xl font-bold text-blue-600">
                            {emp.totalSales} units
                        </p>
                        <p className="text-sm text-gray-600">
                            {emp.salesCount} transactions
                        </p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-bold mb-4">Filters</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Employee Filter */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Employee
                        </label>
                        <select
                            value={filterEmployee}
                            onChange={(e) => setFilterEmployee(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="all">All Employees</option>
                            {employeeStats.map((emp) => (
                                <option
                                    key={emp.utilisateurId ?? emp.employeeName ?? 'unknown'}
                                    value={emp.utilisateurId ?? emp.employeeName}
                                >
                                    {emp.employeeName || "Unknown"}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* From Date */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            From Date
                        </label>
                        <input
                            type="date"
                            value={filterDateFrom}
                            onChange={(e) => setFilterDateFrom(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    {/* To Date */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            To Date
                        </label>
                        <input
                            type="date"
                            value={filterDateTo}
                            onChange={(e) => setFilterDateTo(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                </div>
            </div>

            {/* Sales Table */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Sales Details</h2>
                    <p className="text-lg font-semibold">
                        Total: {totalQuantity} units
                    </p>
                </div>

                <table className="w-full border">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 border">Employee</th>
                            <th className="p-2 border">Product</th>
                            <th className="p-2 border">Quantity</th>
                            <th className="p-2 border">Date</th>
                            <th className="p-2 border">Invoice</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredSales.length > 0 ? (
                            filteredSales.map((sale) => (
                                <tr key={sale.id}>
                                    <td className="p-2 border font-semibold">
                                        {sale.employeeName || "N/A"}
                                    </td>
                                    <td className="p-2 border">
                                        {sale.productName}
                                    </td>
                                    <td className="p-2 border">
                                        {sale.quantity || sale.quantitAc || sale["quantité"] || 0}
                                    </td>
                                    <td className="p-2 border">
                                        {(() => {
                                            const rawDate = sale.dateValue || sale.date;
                                            const parsed = new Date(
                                                typeof rawDate === 'string'
                                                    ? rawDate.replace(" ", "T")
                                                    : rawDate
                                            );
                                            return isNaN(parsed) ? 'N/A' : parsed.toLocaleDateString();
                                        })()}
                                    </td>
                                    <td className="p-2 border space-x-2 text-sm">
                                        <button
                                            onClick={() => handleInvoice(sale.id, 'download')}
                                            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                        >
                                            Download
                                        </button>
                                        <button
                                            onClick={() => handleInvoice(sale.id, 'print')}
                                            className="bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-800"
                                        >
                                            Print
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="p-2 border text-center"
                                >
                                    No sales data
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesReport;
