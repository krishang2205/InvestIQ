import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const Header = () => {
    const { user } = useAuth();

    return (
        <header className="glass-panel" style={{
            height: 'var(--header-height)',
            position: 'fixed',
            top: 0,
            right: 0,
            width: 'calc(100% - var(--sidebar-width))', // Adjust width based on sidebar
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            zIndex: 40,
            borderBottom: '1px solid var(--glass-border)',
            borderLeft: 'none',
            borderTop: 'none',
            borderRight: 'none',
            borderRadius: 0
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Dashboard</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search..."
                        style={{
                            padding: '0.5rem 1rem 0.5rem 2.5rem',
                            borderRadius: '20px',
                            border: '1px solid var(--glass-border)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--color-primary)',
                            outline: 'none',
                            width: '240px'
                        }}
                    />
                </div>

                <button style={{ position: 'relative', background: 'none', color: 'var(--color-primary)' }}>
                    <Bell size={20} />
                    <span style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: 'var(--color-risk-high)',
                        borderRadius: '50%'
                    }}></span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-bg)'
                    }}>
                        <User size={20} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user?.email || 'Guest User'}</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
