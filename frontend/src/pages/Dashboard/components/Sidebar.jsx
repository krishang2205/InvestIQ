import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PieChart, Activity, Settings, LogOut, FileText, Zap, GraduationCap } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const { signOut } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
        { icon: Zap, label: 'Predictions', path: '/dashboard/predictions' },
        { icon: FileText, label: 'Intelligence Report', path: '/dashboard/intelligence-reports' },
        { icon: PieChart, label: 'Portfolio', path: '/dashboard/portfolio' },
        { icon: Activity, label: 'Market Mood', path: '/dashboard/market-mood-index' },
        { icon: GraduationCap, label: 'Learning', path: '/dashboard/learning' },
        { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    ];

    return (
        <aside className="glass-panel sidebar-container" style={{
            width: 'var(--sidebar-width)',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem 1.5rem',
            zIndex: 50,
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
            <div style={{ marginBottom: '3rem', paddingLeft: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="text-gradient-gold" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>InvestIQ</h1>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => window.innerWidth <= 1024 && onClose()}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            color: isActive ? 'var(--color-accent)' : 'var(--color-secondary)',
                            backgroundColor: isActive ? 'rgba(209, 199, 157, 0.1)' : 'transparent',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            fontWeight: isActive ? 600 : 400
                        })}
                    >
                        <item.icon size={20} style={{ marginRight: '0.75rem' }} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <button
                onClick={signOut}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    marginTop: 'auto',
                    backgroundColor: 'transparent',
                    color: 'var(--color-risk-high)',
                    border: 'none',
                    fontSize: '1rem',
                    cursor: 'pointer'
                }}>
                <LogOut size={20} style={{ marginRight: '0.75rem' }} />
                Sign Out
            </button>

            <style>{`
                @media (max-width: 1024px) {
                    .sidebar-container {
                        transform: ${isOpen ? 'translateX(0)' : 'translateX(-100%)'};
                        box-shadow: ${isOpen ? '20px 0 25px -5px rgba(0, 0, 0, 0.3)' : 'none'};
                    }
                }
                @media (min-width: 1025px) {
                    .sidebar-container {
                        transform: translateX(0) !important;
                    }
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;
