import React from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const Header = ({ onToggleSidebar }) => {
    const { user } = useAuth();

    return (
        <header className="glass-panel dashboard-header" style={{
            height: 'var(--header-height)',
            position: 'fixed',
            top: 0,
            right: 0,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            zIndex: 40,
            borderBottom: '1px solid var(--glass-border)',
            borderLeft: 'none',
            borderTop: 'none',
            borderRight: 'none',
            borderRadius: 0,
            transition: 'width 0.3s ease'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                    onClick={onToggleSidebar}
                    className="mobile-menu-btn"
                    style={{
                        background: 'none',
                        color: 'var(--color-primary)',
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <Menu size={24} />
                </button>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Dashboard</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="header-search" style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search..."
                        style={{
                            padding: '0.4rem 1rem 0.4rem 2.2rem',
                            borderRadius: '20px',
                            border: '1px solid var(--glass-border)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--color-primary)',
                            outline: 'none',
                            width: '180px',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button style={{ position: 'relative', background: 'none', color: 'var(--color-primary)', padding: '4px' }}>
                        <Bell size={20} />
                        <span style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            width: '8px',
                            height: '8px',
                            backgroundColor: 'var(--color-risk-high)',
                            borderRadius: '50%'
                        }}></span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-bg)'
                        }}>
                            <User size={18} />
                        </div>
                        <span className="user-email" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                            {user?.email?.split('@')[0] || 'Guest'}
                        </span>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .dashboard-header {
                        width: 100% !important;
                    }
                    .mobile-menu-btn {
                        display: flex !important;
                    }
                    .header-search {
                        display: none !important;
                    }
                    .user-email {
                        display: none !important;
                    }
                }
                @media (min-width: 1025px) {
                    .dashboard-header {
                        width: calc(100% - var(--sidebar-width)) !important;
                    }
                }
            `}</style>
        </header>
    );
};

export default Header;
