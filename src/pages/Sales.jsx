import React, { useState } from 'react';
import { Plus, ShoppingCart, DownloadSimple, MagnifyingGlass, Funnel, Trash, PencilSimple, Clock } from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';

export function Sales() {
    const { transactions, inventory, addTransaction, updateTransaction, deleteTransaction, formatCurrency, t } = useApp();
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTx, setEditingTx] = useState(null);

    const filteredTransactions = transactions.filter(tx =>
        tx.customerName.toLowerCase().includes(search.toLowerCase()) ||
        tx.id.toLowerCase().includes(search.toLowerCase()) ||
        tx.productName.toLowerCase().includes(search.toLowerCase())
    );

    const handleExport = () => {
        const headers = ['ID', 'Date', 'Customer', 'Product', 'Price', 'Qty', 'Total', 'Expiry'];
        const csv = [
            headers.join(','),
            ...transactions.map(t => [t.id, t.date, t.customerName, t.productName, t.sellingPrice, t.quantity, t.totalAmount, t.expiryDate || ''].join(','))
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `sales_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    };

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('sales')}</h1>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <button onClick={handleExport} className="btn btn-secondary">
                        <DownloadSimple size={18} />
                        Export
                    </button>
                    <button onClick={() => { setEditingTx(null); setShowModal(true); }} className="btn btn-primary">
                        <ShoppingCart size={18} weight="fill" />
                        {t('new_transaction')}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <MagnifyingGlass size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search sales..."
                        className="form-input"
                        style={{ paddingLeft: '40px' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>{t('date')}</th>
                            <th>{t('customer')}</th>
                            <th>{t('product')}</th>
                            <th>{t('status')}</th>
                            <th>{t('total')}</th>
                            <th>Expiry / Days</th>
                            <th style={{ textAlign: 'right' }}>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map((tx) => {
                            const daysLeft = tx.expiryDate ? Math.ceil((new Date(tx.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                            return (
                                <tr key={tx.id}>
                                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(tx.date).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{tx.customerName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.phoneNumber}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{tx.subName || tx.productName}</div>
                                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--primary)' }}>{tx.subType || tx.digitalType}</div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${tx.status === 'Completed' ? 'success' : 'warning'}`}>
                                            {tx.status || 'Completed'}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 700 }}>{formatCurrency(tx.totalAmount)}</td>
                                    <td>
                                        {tx.expiryDate ? (
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{tx.expiryDate}</span>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    fontWeight: 800,
                                                    color: daysLeft <= 0 ? '#ef4444' : daysLeft <= 7 ? '#f59e0b' : '#10b981'
                                                }}>
                                                    {daysLeft < 0 ? 'EXPIRED' : daysLeft === 0 ? 'TODAY' : `${daysLeft} DAYS LEFT`}
                                                </span>
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button onClick={() => { setEditingTx(tx); setShowModal(true); }} className="btn-icon">
                                                <PencilSimple size={16} />
                                            </button>
                                            <button onClick={() => deleteTransaction(tx.id)} className="btn-icon" style={{ color: '#ef4444' }}>
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '650px' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{editingTx ? 'Edit Transaction' : 'New Transaction'}</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const data = Object.fromEntries(formData);
                            data.quantity = parseInt(data.quantity);
                            data.sellingPrice = parseFloat(data.sellingPrice);
                            data.totalAmount = data.quantity * data.sellingPrice;

                            // Calculate expiry
                            if (data.startDate && data.duration) {
                                const start = new Date(data.startDate);
                                start.setMonth(start.getMonth() + parseInt(data.duration));
                                data.expiryDate = start.toISOString().split('T')[0];
                            }

                            if (editingTx) updateTransaction(editingTx.id, data);
                            else addTransaction(data);
                            setShowModal(false);
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Customer Name</label>
                                    <input name="customerName" required className="form-input" defaultValue={editingTx?.customerName} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input name="phoneNumber" className="form-input" defaultValue={editingTx?.phoneNumber} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Product</label>
                                <select name="productId" required className="form-select" defaultValue={editingTx?.productId} onChange={(e) => {
                                    const prod = inventory.find(i => i.id === e.target.value);
                                    if (prod && !editingTx) {
                                        document.getElementsByName('sellingPrice')[0].value = prod.price;
                                        document.getElementsByName('productName')[0].value = prod.name;
                                    }
                                }}>
                                    <option value="">Select Product...</option>
                                    {inventory.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.stock} in stock)</option>
                                    ))}
                                </select>
                                <input type="hidden" name="productName" defaultValue={editingTx?.productName} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Sub Name (Opt)</label>
                                    <input name="subName" className="form-input" defaultValue={editingTx?.subName} placeholder="e.g. Atlas, Crystal" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Sub Type</label>
                                    <select name="subType" className="form-select" defaultValue={editingTx?.subType}>
                                        <option value="iptv">IPTV</option>
                                        <option value="player">Player</option>
                                        <option value="digital">Digital Code</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Duration</label>
                                    <select name="duration" className="form-select" defaultValue={editingTx?.duration || "12"}>
                                        <option value="1">1 Month</option>
                                        <option value="3">3 Months</option>
                                        <option value="6">6 Months</option>
                                        <option value="12">12 Months</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Start Date</label>
                                    <input name="startDate" type="date" required className="form-input" defaultValue={editingTx?.startDate || new Date().toISOString().split('T')[0]} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Price</label>
                                    <input name="sellingPrice" type="number" step="0.01" required className="form-input" defaultValue={editingTx?.sellingPrice} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Quantity</label>
                                    <input name="quantity" type="number" required className="form-input" defaultValue={editingTx?.quantity || 1} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Activation Code</label>
                                    <input name="activationCode" className="form-input" defaultValue={editingTx?.activationCode} placeholder="Enter activation code" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">M3U URL</label>
                                    <input name="m3uUrl" className="form-input" defaultValue={editingTx?.m3uUrl} placeholder="Enter M3U link" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <textarea name="notes" className="form-textarea" rows="3" defaultValue={editingTx?.notes} placeholder="Add any additional notes..."></textarea>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select name="status" className="form-select" defaultValue={editingTx?.status || 'Completed'}>
                                    <option value="Completed">Completed</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingTx ? 'Update Sale' : 'Complete Sale'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
