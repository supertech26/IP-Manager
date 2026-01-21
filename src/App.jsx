import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Sales } from './pages/Sales';
import { Reports } from './pages/Reports';
import { Suppliers } from './pages/Suppliers';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useApp } from './context/AppContext';

export function App() {
    const { isAuthenticated } = useApp();

    return (
        <Router>
            <Routes>
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
                <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/sales" element={<Sales />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/suppliers" element={<Suppliers />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>
            </Routes>
        </Router>
    );
}
