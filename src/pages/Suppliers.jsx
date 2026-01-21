import React, { useState } from 'react';
import { Plus, Trash, PencilSimple, Phone, Envelope, Scroll } from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';

export function Suppliers() {
    const { suppliers, addSupplier, updateSupplier, deleteSupplier, t } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('suppliers')}</h1>
                <button onClick={() => { setEditingSupplier(null); setShowModal(true); }} className="btn btn-primary">
                    <Plus size={18} weight="bold" />
                    Add Supplier
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {suppliers.map(sup => (
                    <div key={sup.id} style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '2px' }}>{sup.name}</h3>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{sup.id}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => { setEditingSupplier(sup); setShowModal(true); }} className="btn-icon"><PencilSimple size={16} /></button>
                                <button onClick={() => deleteSupplier(sup.id)} className="btn-icon" style={{ color: '#ef4444' }}><Trash size={16} /></button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '0.8rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem' }}>
                                <Phone size={18} color="var(--primary)" />
                                <span>{sup.phone}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem' }}>
                                <Envelope size={18} color="var(--primary)" />
                                <span>{sup.email}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', fontSize: '0.9rem', marginTop: '0.5rem', padding: '0.8rem', background: 'var(--bg-app)', borderRadius: '8px' }}>
                                <Scroll size={18} color="var(--text-muted)" style={{ marginTop: '2px' }} />
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{sup.notes || 'No notes available'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const data = Object.fromEntries(new FormData(e.target));
                            if (editingSupplier) updateSupplier(editingSupplier.id, data);
                            else addSupplier(data);
                            setShowModal(false);
                        }}>
                            <div className="form-group"><label className="form-label">Name</label><input name="name" required className="form-input" defaultValue={editingSupplier?.name} /></div>
                            <div className="form-group"><label className="form-label">Contact Person</label><input name="contact" className="form-input" defaultValue={editingSupplier?.contact} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group"><label className="form-label">Phone</label><input name="phone" className="form-input" defaultValue={editingSupplier?.phone} /></div>
                                <div className="form-group"><label className="form-label">Email</label><input name="email" className="form-input" defaultValue={editingSupplier?.email} /></div>
                            </div>
                            <div className="form-group"><label className="form-label">Notes</label><textarea name="notes" className="form-textarea" rows="3" defaultValue={editingSupplier?.notes}></textarea></div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Supplier</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
