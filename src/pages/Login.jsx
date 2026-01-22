import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from '@phosphor-icons/react';

export function Login() {
    const { loginWithPin, login, t, settings } = useApp();
    const navigate = useNavigate();
    const [isPinLogin, setIsPinLogin] = useState(true);
    const [pin, setPin] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePinSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await loginWithPin(pin);
            if (result.success) navigate('/');
            else setError(result.message || 'Invalid PIN');
        } catch (err) {
            setError('Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCredsSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(username, password);
            if (result.success) navigate('/');
            else setError(result.message || 'Invalid credentials');
        } catch (err) {
            setError('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '2.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow-glow)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ width: 64, height: 64, margin: '0 auto 1.2rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Lock size={34} weight="fill" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>{settings.appName}</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                        {isPinLogin ? 'Enter PIN to access' : 'Sign in to your account'}
                    </p>
                </div>

                {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.8rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

                {isPinLogin ? (
                    <form onSubmit={handlePinSubmit}>
                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                            <label style={{ display: 'grid', gap: '0.6rem' }}>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        className="login-input"
                                        type="password"
                                        placeholder="Enter PIN"
                                        required
                                        autoFocus
                                        value={pin}
                                        onChange={e => setPin(e.target.value)}
                                        style={{ paddingLeft: '44px', textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
                                    />
                                </div>
                            </label>
                            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', height: '48px', fontSize: '1rem', fontWeight: 600 }}>
                                {loading ? 'Verifying...' : 'Unlock'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleCredsSubmit}>
                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                            <label style={{ display: 'grid', gap: '0.6rem' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Username</span>
                                <div style={{ position: 'relative' }}>
                                    <User size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        className="login-input"
                                        type="text"
                                        required
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        style={{ paddingLeft: '44px' }}
                                    />
                                </div>
                            </label>
                            <label style={{ display: 'grid', gap: '0.6rem' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</span>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        className="login-input"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        style={{ paddingLeft: '44px' }}
                                    />
                                </div>
                            </label>
                            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', height: '48px', fontSize: '1rem', fontWeight: 600 }}>
                                {loading ? 'Authenticating...' : 'Sign In'}
                            </button>
                        </div>
                    </form>
                )}

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <button
                        onClick={() => { setIsPinLogin(!isPinLogin); setError(''); }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        {isPinLogin ? 'Login with ID & Password' : 'Login with PIN'}
                    </button>
                </div>
            </div>
            <style>{`
                .login-input { width: 100%; background: var(--bg-app); border: 1px solid var(--border-subtle); padding: 0.8rem 1rem; border-radius: var(--radius-lg); color: var(--text-primary); font-size: 1rem; outline: none; transition: all 0.2s; }
                .login-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
            `}</style>
        </div>
    );
}
