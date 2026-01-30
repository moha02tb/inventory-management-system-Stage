import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { logoutUser } from '../api/authApi';

const Navbar = () => {
    const { isAuthenticated, isAdmin, role } = useAuth();
    const navigate = useNavigate();

    if (!isAuthenticated) return null;

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    const navLinkClass =
        "px-3 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-900/5 transition";

    return (
        <header className="sticky top-0 z-30 backdrop-blur">
            <div className="max-w-6xl mx-auto px-6 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/80 px-5 py-4 shadow-lg shadow-slate-900/5">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-3 text-slate-900"
                            aria-label="Back to dashboard"
                        >
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 text-sm font-semibold text-white shadow-lg shadow-blue-500/30">
                                SM
                            </div>
                            <div>
                                <div className="text-base font-semibold tracking-tight">Stock Manager</div>
                                <p className="text-xs text-slate-500">Inventory &amp; sales control</p>
                            </div>
                        </Link>
                    </div>

                    <nav className="flex flex-wrap items-center gap-2">
                        <Link to="/products" className={navLinkClass}>Products</Link>
                        <Link to="/sales" className={navLinkClass}>Sales</Link>
                        <Link to="/issues" className={navLinkClass}>Issues</Link>
                        {isAdmin && (
                            <>
                                <Link to="/stock" className={navLinkClass}>Stock Movements</Link>
                                <Link to="/products/add" className={navLinkClass}>Add Product</Link>
                                <Link to="/admin/employees" className={navLinkClass}>Employees</Link>
                                <Link to="/admin/sales-report" className={navLinkClass}>Sales Report</Link>
                                <Link to="/admin/issues-report" className={navLinkClass}>Issues Report</Link>
                            </>
                        )}
                    </nav>

                    <div className="flex items-center gap-3">
                        <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-700 capitalize">
                            {role || 'guest'}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="rounded-full bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-slate-900/20 transition hover:translate-y-px hover:shadow-lg"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
