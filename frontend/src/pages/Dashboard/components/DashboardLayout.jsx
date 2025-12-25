import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = () => {
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
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
