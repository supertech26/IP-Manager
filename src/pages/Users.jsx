import React, { useState } from 'react';
import { Plus, UserPlus, Trash, PencilSimple, ShieldCheck } from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';

export function Users() {
    const { users, addUser, updateUser, deleteUser, t } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('users')}</h1>
                <button onClick={() => { setEditingUser(null); setShowModal(true); }} className="btn btn-primary">
                    <UserPlus size={18} weight="bold" />
                    Add User
                </button>
            </div>

            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>{t('username')}</th>
                            <th>{t('email')}</th>
                            <th>{t('role')}</th>
                            <th>{t('status')}</th>
                            <th style={{ textAlign: 'right' }}>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td><div style={{ fontWeight: 600 }}>{user.username}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.name}</div></td>
                                <td>{user.email}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                                        <ShieldCheck size={16} color={user.role === 'Admin' ? 'var(--primary)' : 'var(--text-muted)'} />
                                        {user.role}
                                    </div>
                                </td>
                                <td><span className={`badge badge-${user.status === 'Active' ? 'success' : 'danger'}`}>{user.status}</span></td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button onClick={() => { setEditingUser(user); setShowModal(true); }} className="btn-icon"><PencilSimple size={16} /></button>
                                        <button onClick={() => deleteUser(user.id)} className="btn-icon" style={{ color: '#ef4444' }}><Trash size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '450px' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingUser ? 'Edit User' : 'New User'}</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const data = Object.fromEntries(new FormData(e.target));
                            if (editingUser) updateUser(editingUser.id, data);
                            else addUser(data);
                            setShowModal(false);
                        }}>
                            <div className="form-group"><label className="form-label">Full Name</label><input name="name" required className="form-input" defaultValue={editingUser?.name} /></div>
                            <div className="form-group"><label className="form-label">Username</label><input name="username" required className="form-input" defaultValue={editingUser?.username} /></div>
                            <div className="form-group"><label className="form-label">Email</label><input name="email" type="email" required className="form-input" defaultValue={editingUser?.email} /></div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select name="role" className="form-select" defaultValue={editingUser?.role || 'Staff'}>
                                    <option>Admin</option>
                                    <option>Staff</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
