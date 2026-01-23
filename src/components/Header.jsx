import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, MagnifyingGlass, User, Warning, Package, SignOut, CaretDown, Clock } from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';

export function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, currentUser, logout, transactions, inventory } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const notifMenuRef = useRef(null);
    const profileMenuRef = useRef(null);

    // Get current page title
    const path = location.pathname;
    const title = t(path === '/' ? 'dashboard' : path.slice(1));

    // Expiry Notifications Calculation
    const expiringSoon = transactions.filter(t => {
        if (!t.expiryDate || t.status !== 'Completed') return false;
        const diffTime = new Date(t.expiryDate) - new Date();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
    });

    const lowStockItems = inventory.filter(i => i.status === 'Low Stock' || i.stock <= (i.lowStockThreshold || 10));

    const totalNotifications = expiringSoon.length + lowStockItems.length;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) setShowNotifications(false);
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) setShowProfile(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };



    return (
        <header className="header">
            <h1 className="page-title">{title}</h1>

            {/* Search Bar - Centered and Larger */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-app)',
                    padding: '0.6rem 1.2rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-subtle)',
                    gap: '0.8rem',
                    width: '450px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)'
                }}
            >
                <MagnifyingGlass size={20} color="var(--text-secondary)" />
                <input
                    type="text"
                    placeholder="Search customers, products, or subscriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    style={{
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        width: '100%'
                    }}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {/* Notifications */}
                <div style={{ position: 'relative' }} ref={notifMenuRef}>
                    <button
                        className="btn-icon"
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{ position: 'relative' }}
                    >
                        <Bell size={22} />
                        {totalNotifications > 0 && (
                            <span style={{
                                position: 'absolute', top: '-4px', right: '-4px',
                                background: '#ef4444', color: 'white',
                                fontSize: '0.65rem', fontWeight: 700,
                                minWidth: '16px', height: '16px', borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid var(--bg-surface)'
                            }}>
                                {totalNotifications}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div style={{
                            position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
                            width: '320px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', zIndex: 100,
                            maxHeight: '400px', overflowY: 'auto'
                        }}>
                            <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Notifications</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{totalNotifications} New</span>
                            </div>

                            {totalNotifications === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    No new notifications
                                </div>
                            ) : (
                                <div style={{ padding: '0.5rem' }}>
                                    {expiringSoon.map(sub => (
                                        <div key={sub.id} onClick={() => { navigate('/sales'); setShowNotifications(false); }} style={{ padding: '0.8rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', gap: '0.8rem' }} className="hover-bg">
                                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Clock size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Expiry Warning</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sub.customerName}'s sub is expiring.</div>
                                            </div>
                                        </div>
                                    ))}
                                    {lowStockItems.map(item => (
                                        <div key={item.id} onClick={() => { navigate('/inventory'); setShowNotifications(false); }} style={{ padding: '0.8rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', gap: '0.8rem' }} className="hover-bg">
                                            <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Low Stock</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.name} is running low ({item.stock} left).</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div style={{ position: 'relative' }} ref={profileMenuRef}>
                    <button
                        className="btn"
                        onClick={() => setShowProfile(!showProfile)}
                        style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '0.4rem 0.8rem' }}
                    >
                        <div style={{ width: 24, height: 24, borderRadius: '6px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                            {currentUser?.name?.[0]}
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{currentUser?.name}</span>
                        <CaretDown size={14} color="var(--text-secondary)" />
                    </button>

                    {showProfile && (
                        <div style={{
                            position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
                            width: '200px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', zIndex: 100,
                            padding: '0.5rem'
                        }}>
                            <div style={{ padding: '0.5rem 0.8rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.3rem' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{currentUser?.role}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{currentUser?.email}</div>
                            </div>
                            <button onClick={() => { navigate('/settings'); setShowProfile(false); }} className="nav-item hover-bg" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '0.6rem 0.8rem' }}>
                                <span>Settings</span>
                            </button>
                            <button onClick={logout} className="nav-item hover-bg" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '0.6rem 0.8rem', color: '#ef4444' }}>
                                <span>{t('logout')}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .hover-bg:hover { background: rgba(255, 255, 255, 0.04); }
            `}</style>
        </header>
    );
}
