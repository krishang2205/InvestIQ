import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children }) => {
    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-primary)'
        }}>
            <Sidebar />
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                marginLeft: 'var(--sidebar-width)', // Sidebar is fixed width
                width: `calc(100% - var(--sidebar-width))`
            }}>
                <Header />
                <main style={{
                    flex: 1,
                    padding: '2rem',
                    marginTop: 'var(--header-height)'
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
