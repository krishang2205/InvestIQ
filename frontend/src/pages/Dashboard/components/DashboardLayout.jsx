import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-primary)',
            overflowX: 'hidden'
        }}>
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                transition: 'margin-left 0.3s ease',
                marginLeft: window.innerWidth > 1024 ? 'var(--sidebar-width)' : '0'
            }} className="dashboard-content-wrapper">
                <Header onToggleSidebar={toggleSidebar} />
                <main style={{
                    flex: 1,
                    padding: '1.5rem',
                    paddingTop: 'calc(var(--header-height) + 1.5rem)',
                    width: '100%',
                    maxWidth: '100vw',
                    boxSizing: 'border-box'
                }}>
                    <Outlet />
                </main>
            </div>
            
            {/* Overlay for mobile when sidebar is open */}
            {isSidebarOpen && (
                <div 
                    onClick={closeSidebar}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 45,
                        display: window.innerWidth <= 1024 ? 'block' : 'none'
                    }}
                />
            )}

            <style>{`
                @media (max-width: 1024px) {
                    .dashboard-content-wrapper {
                        margin-left: 0 !important;
                    }
                }
                @media (min-width: 1025px) {
                    .dashboard-content-wrapper {
                        margin-left: var(--sidebar-width) !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default DashboardLayout;
