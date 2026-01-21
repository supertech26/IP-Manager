import React from 'react';
import { ChartPieSlice, TrendUp, Users, Package } from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';

export function Reports() {
    const { transactions, inventory, formatCurrency, t } = useApp();

    const totalSales = transactions.length;
    const totalRevenue = transactions.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalProfit = transactions.reduce((acc, curr) => acc + (curr.profit || 0), 0);

    const salesByDay = transactions.reduce((acc, curr) => {
        const day = new Date(curr.date).toLocaleDateString();
        acc[day] = (acc[day] || 0) + curr.totalAmount;
        return acc;
    }, {});

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2.5rem' }}>{t('reports')}</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="report-card">
                    <TrendUp size={32} color="var(--primary)" />
                    <h3>{totalSales}</h3>
                    <p>Total Sales count</p>
                </div>
                <div className="report-card">
                    <ChartPieSlice size={32} color="var(--success)" />
                    <h3>{formatCurrency(totalRevenue)}</h3>
                    <p>Gross Revenue</p>
                </div>
                <div className="report-card">
                    <Users size={32} color="var(--accent)" />
                    <h3>{formatCurrency(totalProfit)}</h3>
                    <p>Net Profit</p>
                </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border-subtle)' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Daily Sales Summary</h2>
                <div style={{ display: 'grid', gap: '0.8rem' }}>
                    {Object.entries(salesByDay).map(([day, total]) => (
                        <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
                            <span style={{ fontWeight: 600 }}>{day}</span>
                            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(total)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .report-card { background: var(--bg-surface); padding: 2rem; border-radius: var(--radius-xl); border: 1px solid var(--border-subtle); display: flex; flex-direction: column; align-items: center; gap: 0.5rem; text-align: center; }
                .report-card h3 { font-size: 1.5rem; font-weight: 800; margin-top: 0.5rem; }
                .report-card p { font-size: 0.85rem; color: var(--text-secondary); }
            `}</style>
        </div>
    );
}
