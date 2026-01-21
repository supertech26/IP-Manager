import React, { useState, useMemo } from 'react';
import { Plus, ShoppingCart, CheckCircle, Wallet, Coins, Package, ArrowRight, Warning } from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';

export function Dashboard() {
    const { inventory, transactions, formatCurrency, t } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    // Extract search query from URL
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search') || '';

    // Search filtering
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return { inventory: [], transactions: [] };

        const query = searchQuery.toLowerCase();

        const filteredInventory = inventory.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.id.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query) ||
            item.supplier?.toLowerCase().includes(query)
        );

        const filteredTransactions = transactions.filter(tx =>
            tx.customerName?.toLowerCase().includes(query) ||
            tx.phoneNumber?.toLowerCase().includes(query) ||
            tx.productName?.toLowerCase().includes(query) ||
            tx.subName?.toLowerCase().includes(query) ||
            tx.id.toLowerCase().includes(query) ||
            tx.m3uUrl?.toLowerCase().includes(query) ||
            tx.activationCode?.toLowerCase().includes(query)
        );

        return { inventory: filteredInventory, transactions: filteredTransactions };
    }, [searchQuery, inventory, transactions]);

    // Derived Metrics
    const totalTransactions = transactions?.length || 0;
    const completedTransactions = transactions?.filter(tx => tx.status === 'Completed') || [];
    const totalIncome = completedTransactions.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const totalExpenses = inventory?.reduce((acc, curr) => {
        const cost = curr.costPrice || 0;
        const initial = curr.initialStock || 0;
        const current = curr.stock || 0;
        return acc + (cost * Math.max(0, initial - current));
    }, 0) || 0;
    const totalProfit = totalIncome - totalExpenses;

    const stockItems = inventory.length;
    const lowStockCount = inventory.filter(i => i.status === 'Low Stock' || i.stock <= (i.lowStockThreshold || 10)).length;

    const recentTransactions = transactions.slice(0, 5);

    const expiringSoon = transactions.filter(t => {
        if (!t.expiryDate || t.status !== 'Completed') return false;
        const diffTime = new Date(t.expiryDate) - new Date();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
    });

    const financialStats = [
        { label: t('total_income'), value: formatCurrency(totalIncome), icon: Wallet, color: 'var(--primary)' },
        { label: t('total_expenses'), value: formatCurrency(totalExpenses), icon: Coins, color: '#ef4444' },
        { label: t('total_profit'), value: formatCurrency(totalProfit), icon: CheckCircle, color: '#10b981' },
    ];

    const operationalStats = [
        { label: t('active_products'), value: stockItems, icon: Package, color: 'var(--primary)' },
        { label: t('total_sales'), value: totalTransactions, icon: ShoppingCart, color: 'var(--accent)' },
        { label: t('low_stock_alerts'), value: lowStockCount, subValue: `${lowStockCount} items`, icon: Warning, color: lowStockCount > 0 ? '#ef4444' : 'var(--text-secondary)' },
    ];

    return (
        <div style={{ padding: '0.5rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.2rem' }}>{t('dashboard')}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Welcome back! Here's what's happening today.</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/inventory')} className="btn btn-primary" style={{ padding: '0.8rem 1.5rem' }}>
                    <Plus size={20} weight="bold" />
                    {t('add_product')}
                </button>
                <button onClick={() => navigate('/sales')} className="btn btn-secondary" style={{ padding: '0.8rem 1.5rem' }}>
                    <ShoppingCart size={20} weight="fill" />
                    {t('new_transaction')}
                </button>
            </div>

            {/* Search Results Section */}
            {searchQuery && (
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Search Results for "{searchQuery}"</h2>
                        <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                            Clear Search
                        </button>
                    </div>

                    {/* Inventory Results */}
                    {searchResults.inventory.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary)' }}>
                                Products ({searchResults.inventory.length})
                            </h3>
                            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Stock</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchResults.inventory.map(item => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.id}</div>
                                                </td>
                                                <td>{item.category}</td>
                                                <td style={{ fontWeight: 600 }}>{formatCurrency(item.price)}</td>
                                                <td>{item.stock}</td>
                                                <td>
                                                    <span className={`badge badge-${item.status === 'Active' ? 'success' : item.status === 'Low Stock' ? 'warning' : 'danger'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button onClick={() => navigate('/inventory')} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Transaction Results */}
                    {searchResults.transactions.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary)' }}>
                                Sales ({searchResults.transactions.length})
                            </h3>
                            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Customer</th>
                                            <th>Product</th>
                                            <th>Amount</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchResults.transactions.map(tx => (
                                            <tr key={tx.id}>
                                                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    {new Date(tx.date).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{tx.customerName}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.phoneNumber}</div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 500 }}>{tx.subName || tx.productName}</div>
                                                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--primary)' }}>{tx.subType}</div>
                                                </td>
                                                <td style={{ fontWeight: 700 }}>{formatCurrency(tx.totalAmount)}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button onClick={() => navigate('/sales')} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* No Results */}
                    {searchResults.inventory.length === 0 && searchResults.transactions.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
                            <Package size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No results found</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Try searching with different keywords
                            </p>
                        </div>
                    )}
                </div>
            )}

            {expiringSoon.length > 0 && (
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', color: '#ef4444' }}>
                        <Warning size={22} weight="fill" />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Subscriptions Expiring Soon</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                        {expiringSoon.map(sub => {
                            const daysLeft = Math.ceil((new Date(sub.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                            return (
                                <div key={sub.id} style={{
                                    background: 'rgba(239, 68, 68, 0.05)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    padding: '1.2rem',
                                    borderRadius: 'var(--radius-lg)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }}>{sub.customerName}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sub.subName || sub.productName}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            fontWeight: 800,
                                            color: daysLeft <= 0 ? '#ef4444' : '#f59e0b'
                                        }}>
                                            {daysLeft < 0 ? 'Expired' : daysLeft === 0 ? 'Today' : `${daysLeft} Days Left`}
                                        </div>
                                        <button onClick={() => navigate('/sales')} style={{ fontSize: '0.75rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontWeight: 600 }}>
                                            Renew
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {financialStats.map((stat, index) => (
                    <div key={index} style={{
                        background: 'var(--bg-surface)', padding: '1.5rem',
                        borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: '12px',
                            background: `${stat.color}15`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color,
                            marginBottom: '1.2rem'
                        }}>
                            <stat.icon size={24} weight="fill" />
                        </div>
                        <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem' }}>{stat.label}</h3>
                        <p style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {operationalStats.map((stat, index) => (
                    <div key={index} style={{
                        background: 'var(--bg-surface)', padding: '1.5rem',
                        borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)',
                        display: 'flex', alignItems: 'center', gap: '1.2rem shadow-sm'
                    }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: '14px',
                            background: `${stat.color}15`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color
                        }}>
                            <stat.icon size={26} weight="fill" />
                        </div>
                        <div>
                            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.1rem' }}>{stat.label}</h3>
                            <p style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{stat.value}</p>
                            {stat.subValue && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: stat.color }}>{stat.subValue}</span>}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t('recent_transactions')}</h2>
                    <button onClick={() => navigate('/reports')} className="btn" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                        {t('view')} {t('reports')} <ArrowRight weight="bold" />
                    </button>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>{t('product')}</th>
                            <th>{t('amount')}</th>
                            <th style={{ textAlign: 'right' }}>{t('date')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentTransactions.map(tx => (
                            <tr key={tx.id}>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{tx.subName || tx.productName}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tx.customerName}</div>
                                </td>
                                <td style={{ fontWeight: 700 }}>{formatCurrency(tx.sellingPrice * tx.quantity)}</td>
                                <td style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {new Date(tx.date).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
