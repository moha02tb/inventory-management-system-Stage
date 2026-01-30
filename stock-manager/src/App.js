import React from 'react';
// 1. CRITICAL: Only import Routes, Route, and Navigate.
import { Routes, Route, Navigate } from 'react-router-dom'; 

// 2. Import Protected Route
import ProtectedRoute from './components/ProtectedRoute'; 

// 3. Import Layout and Pages
import Layout from './components/Layout'; 
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import StockMovement from './pages/StockMovement';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Sales from './pages/Sales';
import Issues from './pages/Issues';
import SalesReport from './pages/SalesReport';
import IssuesReport from './pages/IssuesReport';
import ManageEmployees from './pages/ManageEmployees'; 

function App() {
    return (
        // Must start with <Routes> (assuming AuthProvider and BrowserRouter are in index.js)
        <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* All protected routes go inside the Layout route */}
            <Route element={<Layout />}>
                
                {/* Management/CRUD Routes (Restricted to Administrateur) - MUST BE FIRST */}
                <Route 
                    path="/products/add" 
                    element={<ProtectedRoute allowedRoles={['admin']}><AddProduct /></ProtectedRoute>} 
                />
                <Route 
                    path="/products/edit/:id" 
                    element={<ProtectedRoute allowedRoles={['admin']}><EditProduct /></ProtectedRoute>} 
                />
                
                {/* Products List (Accessible by both) - MUST BE AFTER ADD/EDIT */}
                <Route 
                    path="/products" 
                    element={<ProtectedRoute allowedRoles={['admin', 'staff', 'employee']}><Products /></ProtectedRoute>} 
                />

                {/* Dashboard (Accessible by both Administrateur and Employé) */}
                <Route 
                    path="/dashboard" 
                    element={<ProtectedRoute allowedRoles={['admin', 'staff', 'employee']}><Dashboard /></ProtectedRoute>} 
                />
                
                {/* Stock Movement (Admin only, matches backend restriction) */}
                <Route 
                    path="/stock" 
                    element={<ProtectedRoute allowedRoles={['admin']}><StockMovement /></ProtectedRoute>} 
                />

                {/* Sales (Accessible by employees and admin) */}
                <Route 
                    path="/sales" 
                    element={<ProtectedRoute allowedRoles={['admin', 'staff', 'employee']}><Sales /></ProtectedRoute>} 
                />

                {/* Issues/Reports (Accessible by all) */}
                <Route 
                    path="/issues" 
                    element={<ProtectedRoute allowedRoles={['admin', 'staff', 'employee']}><Issues /></ProtectedRoute>} 
                />

                {/* Admin Sales Report (Restricted to admin) */}
                <Route 
                    path="/admin/sales-report" 
                    element={<ProtectedRoute allowedRoles={['admin']}><SalesReport /></ProtectedRoute>} 
                />

                {/* Admin Issues Report (Restricted to admin) */}
                <Route 
                    path="/admin/issues-report" 
                    element={<ProtectedRoute allowedRoles={['admin']}><IssuesReport /></ProtectedRoute>} 
                />

                {/* Admin Manage Employees (Restricted to admin) */}
                <Route 
                    path="/admin/employees" 
                    element={<ProtectedRoute allowedRoles={['admin']}><ManageEmployees /></ProtectedRoute>} 
                />
                
                {/* Fallback/Redirect */}
                {/* The root path / should redirect to /dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                {/* The wildcard * path should redirect to /dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
        </Routes>
    );
}

export default App;
