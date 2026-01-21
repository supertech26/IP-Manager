import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Layout as DashboardIcon,
    Package,
    ShoppingCart,
    ChartBar,
    Users as UsersIcon,
    Gear,
    SignOut,
    Truck
} from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';

export function Sidebar() {
    const { logout, t, settings } = useApp();

    const menuItems = [
        { path: '/', label: t('dashboard'), icon: DashboardIcon },
        { path: '/inventory', label: t('inventory'), icon: Package },
        { path: '/sales', label: t('sales'), icon: ShoppingCart },
        { path: '/reports', label: t('reports'), icon: ChartBar },
        { path: '/suppliers', label: t('suppliers'), icon: Truck },
        { path: '/users', label: t('users'), icon: UsersIcon },
        { path: '/settings', label: t('settings'), icon: Gear },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <DashboardIcon size={24} weight="fill" />
                </div>
                <h2 className="brand-title">{settings.appName}</h2>
            </div>

            <nav className="nav-menu">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={22} weight="duotone" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button onClick={logout} className="nav-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <SignOut size={22} weight="duotone" />
                    <span>{t('logout')}</span>
                </button>
            </div>
        </aside>
    );
}
