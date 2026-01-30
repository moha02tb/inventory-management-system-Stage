import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getProducts } from "../api/productApi";
import { getOpenStockAlerts } from "../api/alertApi";
import { getSalesReport } from "../api/salesApi";

import { Bar, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
    const { role, name, isLoading } = useAuth();
    const [products, setProducts] = useState([]);
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    const [salesReport, setSalesReport] = useState({ sales: [], stats: [] });
    const [loading, setLoading] = useState(true);

    const getQty = (p) => {
        const candidates = ["quantitAc", "quantite", "quantité", "quantiteAc", "quantiteac", "quantity", "stock"];
        for (const key of candidates) {
            if (p[key] !== undefined && p[key] !== null) return p[key];
        }
        return 0;
    };

    const totalUnits = products.reduce((sum, p) => sum + Number(getQty(p) || 0), 0);
    const lowStockCount = lowStockAlerts.length;

    const loadData = async () => {
        setLoading(true);
        try {
            const baseCalls = [getProducts(), getOpenStockAlerts()];
            const adminCalls = role === "admin" ? [getSalesReport()] : [];
            const [productsData, alertsData, salesReportData] = await Promise.all([...baseCalls, ...adminCalls]);
            setProducts(productsData);
            setLowStockAlerts(alertsData);
            if (salesReportData) {
                setSalesReport(salesReportData);
            } else {
                setSalesReport({ sales: [], stats: [] });
            }
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoading) return;
        loadData();
    }, [role, isLoading]);

    const stockChartData = useMemo(() => {
        return {
            labels: products.map((p) => p.nom),
            datasets: [
                {
                    label: "Current Stock",
                    data: products.map((p) => Number(getQty(p)) || 0),
                    backgroundColor: "rgba(59, 130, 246, 0.7)",
                },
            ],
        };
    }, [products]);

    const salesTrend = useMemo(() => {
        if (!salesReport.sales?.length) return { labels: [], data: [] };
        const byDate = salesReport.sales.reduce((acc, sale) => {
            const qty = sale.quantitAc ?? sale.quantite ?? sale["quantité"] ?? 0;
            const dateKey = new Date(sale.date).toISOString().split("T")[0];
            acc[dateKey] = (acc[dateKey] || 0) + Number(qty);
            return acc;
        }, {});
        const labels = Object.keys(byDate).sort();
        return { labels, data: labels.map((d) => byDate[d]) };
    }, [salesReport.sales]);

    const employeePerformance = useMemo(() => {
        if (!salesReport.stats?.length) return [];
        return [...salesReport.stats]
            .filter((stat) => stat.employeeName && stat.employeeRole !== "admin")
            .sort((a, b) => Number(b.totalSales || 0) - Number(a.totalSales || 0));
    }, [salesReport.stats]);

    const totalSalesUnits = useMemo(() => {
        return salesReport.sales.reduce((sum, sale) => {
            const qty = sale.quantitAc ?? sale.quantite ?? sale["quantité"] ?? 0;
            return sum + Number(qty);
        }, 0);
    }, [salesReport.sales]);

    const activeEmployees = employeePerformance.length;

    const lineChartData = {
        labels: salesTrend.labels,
        datasets: [
            {
                label: "Units sold",
                data: salesTrend.data,
                fill: true,
                borderColor: "rgb(79, 70, 229)",
                backgroundColor: "rgba(79, 70, 229, 0.12)",
                tension: 0.35,
                pointRadius: 4,
                pointBackgroundColor: "#4f46e5",
            },
        ],
    };

    const employeeBarData = {
        labels: employeePerformance.map((e) => e.employeeName || "Unknown"),
        datasets: [
            {
                label: "Total units sold",
                data: employeePerformance.map((e) => e.totalSales),
                backgroundColor: "rgba(16, 185, 129, 0.75)",
            },
        ],
    };

    if (loading || isLoading) {
        return (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 text-slate-500 shadow-inner">
                Loading dashboard data...
            </div>
        );
    }

    // Employee Dashboard
    if (role === "employee") {
        return (
            <div className="space-y-6">
                <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-lg shadow-slate-900/5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Operations</p>
                    <h1 className="text-3xl font-semibold text-slate-900">Welcome, {name || "team member"}</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Use the quick actions to keep stock, sales, and issues up to date.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-6 shadow-lg shadow-slate-900/5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-slate-900">Quick actions</h2>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
                                Fast lane
                            </span>
                        </div>
                        <div className="mt-4 space-y-3">
                            <a
                                href="/sales"
                                className="flex items-center justify-between rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:translate-y-px hover:shadow-xl"
                            >
                                <span>Record a sale</span>
                                <span className="text-xs">→</span>
                            </a>
                            <a
                                href="/issues"
                                className="flex items-center justify-between rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:translate-y-px hover:shadow-xl"
                            >
                                <span>Report an issue</span>
                                <span className="text-xs">→</span>
                            </a>
                            <a
                                href="/stock"
                                className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:translate-y-px hover:shadow-xl"
                            >
                                <span>Log stock movement</span>
                                <span className="text-xs">→</span>
                            </a>
                        </div>
                    </div>

                    {lowStockCount > 0 && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-lg shadow-amber-500/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Attention</p>
                                    <h2 className="text-xl font-semibold text-amber-900">Low stock items</h2>
                                </div>
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-800 shadow-sm">
                                    {lowStockCount} items
                                </span>
                            </div>
                            <ul className="mt-4 space-y-2">
                                {lowStockAlerts.slice(0, 5).map((alert) => (
                                    <li
                                        key={alert.id}
                                        className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm text-slate-800 shadow-inner shadow-amber-900/5"
                                    >
                                        <span className="font-semibold">{alert.produitNom}</span>
                                        <span className="text-xs text-amber-700">Stock: {alert.currentQuantite}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-900/10">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Products</p>
                        <p className="text-2xl font-semibold text-slate-900">{products.length}</p>
                        <p className="text-sm text-slate-500">Items you can interact with today.</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm shadow-emerald-500/10">
                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Stock on hand</p>
                        <p className="text-2xl font-semibold text-emerald-900">{totalUnits}</p>
                        <p className="text-sm text-emerald-700">Sum of all available units.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-900/10">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Alerts</p>
                        <p className="text-2xl font-semibold text-slate-900">{lowStockCount}</p>
                        <p className="text-sm text-slate-500">Watch items trending low.</p>
                    </div>
                </div>
            </div>
        );
    }

    const topStockedProduct = products.length
        ? [...products].sort((a, b) => (b.quantitAc || 0) - (a.quantitAc || 0))[0]?.nom
        : "N/A";
    const averageStock = products.length ? Math.round(totalUnits / products.length) : 0;
    const topEmployee = employeePerformance[0]?.employeeName || "N/A";

    // Admin Dashboard
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Overview</p>
                    <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
                    <p className="text-sm text-slate-500">Snapshot of products, sales, stock health, and people.</p>
                </div>
                <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-800">Admin view</span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-900/5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Products</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{products.length}</p>
                    <p className="text-sm text-slate-500">Active SKUs.</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-lg shadow-emerald-500/10">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Total stock</p>
                    <p className="mt-2 text-3xl font-semibold text-emerald-900">{totalUnits}</p>
                    <p className="text-sm text-emerald-800">Units on hand.</p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-100 to-amber-50 p-5 shadow-lg shadow-amber-500/10">
                    <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Low stock</p>
                    <p className="mt-2 text-3xl font-semibold text-amber-900">{lowStockCount}</p>
                    <p className="text-sm text-amber-800">Items needing reorder.</p>
                </div>
                <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-lg shadow-indigo-500/10">
                    <p className="text-xs uppercase tracking-[0.2em] text-indigo-700">Units sold</p>
                    <p className="mt-2 text-3xl font-semibold text-indigo-900">{totalSalesUnits}</p>
                    <p className="text-sm text-indigo-800">Across recorded sales.</p>
                </div>
            </div>

            {lowStockCount > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm shadow-amber-500/10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-amber-900">Low stock alerts</h2>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-800 shadow-sm">
                            {lowStockCount} items
                        </span>
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-800">
                        {lowStockAlerts.map((alert) => (
                            <li
                                key={alert.id}
                                className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-inner shadow-amber-900/5"
                            >
                                <span className="font-semibold">{alert.produitNom}</span>
                                <span className="text-xs text-amber-700">
                                    Stock {alert.currentQuantite} / Min {alert.threshold}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-900/5 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Stock overview</p>
                            <h2 className="text-xl font-semibold text-slate-900">Quantity by product</h2>
                        </div>
                        <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-700">Chart</span>
                    </div>
                    <div className="mt-4 h-96">
                        <Bar data={stockChartData} />
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-900/5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Highlights</p>
                    <ul className="mt-4 space-y-3 text-sm text-slate-800">
                        <li className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
                            <span className="font-semibold">Top stocked item</span>
                            <span className="text-xs text-slate-500">{topStockedProduct}</span>
                        </li>
                        <li className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
                            <span className="font-semibold">Average stock</span>
                            <span className="text-xs text-slate-500">{averageStock} units</span>
                        </li>
                        <li className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
                            <span className="font-semibold">Top employee</span>
                            <span className="text-xs text-slate-500">{topEmployee}</span>
                        </li>
                        <li className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
                            <span className="font-semibold">Open alerts</span>
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                                {lowStockCount}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-lg shadow-indigo-500/10 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-indigo-600">Sales trend</p>
                            <h2 className="text-xl font-semibold text-slate-900">Units sold over time</h2>
                        </div>
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                            {salesTrend.labels.length || 0} days
                        </span>
                    </div>
                    <div className="mt-4 h-80">
                        <Line data={lineChartData} />
                    </div>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-lg shadow-emerald-500/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">People</p>
                            <h2 className="text-xl font-semibold text-slate-900">Employee performance</h2>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {activeEmployees} active
                        </span>
                    </div>
                    <div className="mt-4 h-80">
                        {employeePerformance.length ? (
                            <Bar data={employeeBarData} />
                        ) : (
                            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-emerald-200 text-sm text-emerald-700">
                                No employee sales data yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
