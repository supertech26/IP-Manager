import React, { useState } from 'react';
import { Gear, Database, UserGear, FloppyDisk } from '@phosphor-icons/react';
import { useApp } from '../context/AppContext';

export function Settings() {
    const { settings, updateSettings, exportData, importData, t, activityLogs, updateAccount, currentUser } = useApp();
    const [activeTab, setActiveTab] = useState('general');
    const [saveStatus, setSaveStatus] = useState('');

    const handleSave = (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));
        updateSettings(data);
        setSaveStatus('Settings saved successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Gear },
        { id: 'account', label: 'Account', icon: UserGear },
        { id: 'backup', label: 'Backup & Restore', icon: Database },
        { id: 'logs', label: 'Activity Logs', icon: Database },
    ];

    return (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem' }}>{t('settings')}</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            style={{ background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.1)' : 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                        >
                            <tab.icon size={20} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '2.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)' }}>
                    {activeTab === 'general' && (
                        <form onSubmit={handleSave}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>General Settings</h2>
                            <div className="form-group">
                                <label className="form-label">Application Name</label>
                                <input name="appName" className="form-input" defaultValue={settings.appName} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Default Currency</label>
                                    <select name="currency" className="form-select" defaultValue={settings.currency}>
                                        <option>MAD</option>
                                        <option>USD</option>
                                        <option>EUR</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Language</label>
                                    <select name="language" className="form-select" defaultValue={settings.language}>
                                        <option value="en">English</option>
                                        <option value="fr">Français</option>
                                        <option value="ar">العربية</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                <FloppyDisk size={18} />
                                Save Changes
                            </button>
                            {saveStatus && <p style={{ marginTop: '1rem', color: 'var(--success)', fontSize: '0.9rem', fontWeight: 600 }}>{saveStatus}</p>}
                        </form>
                    )}

                    {activeTab === 'account' && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Account Management</h2>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const data = Object.fromEntries(new FormData(e.target));
                                const res = await updateAccount(data.username, data.password);
                                if (res.success) alert('Account updated!');
                            }}>
                                <div className="form-group">
                                    <label className="form-label">Username</label>
                                    <input name="username" className="form-input" defaultValue={currentUser?.username} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">New Password</label>
                                    <input name="password" type="password" className="form-input" placeholder="Leave blank to keep current" />
                                </div>
                                <button type="submit" className="btn btn-primary">Update Profile</button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'logs' && (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>System Activity Logs</h2>
                            <div style={{ display: 'grid', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                {activityLogs.map(log => (
                                    <div key={log.id} style={{ padding: '1rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', dispaly: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{log.action}: {log.details}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>by {log.user}</div>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                                            {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'backup' && (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <Database size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Data Backup</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Download a complete backup of your system data or restore from a previous one.</p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button onClick={() => {
                                    const data = exportData();
                                    const blob = new Blob([data], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a'); a.href = url; a.download = 'ip_manager_backup.json'; a.click();
                                }} className="btn btn-primary">Export JSON</button>
                                <label className="btn btn-secondary">
                                    Import JSON
                                    <input type="file" hidden onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const text = await file.text();
                                            importData(text);
                                        }
                                    }} />
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
