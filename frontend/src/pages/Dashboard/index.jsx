
import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
    const { user, signOut } = useAuth();

    return (
        <div style={{ padding: '2rem', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Dashboard</h1>
            <p>Welcome, {user?.email}!</p>
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <h3>You are authenticated.</h3>
                <p>This is a protected area. Only logged-in users can see this.</p>
            </div>
            <button
                onClick={signOut}
                style={{
                    marginTop: '2rem',
                    padding: '0.5rem 1rem',
                    background: '#EF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Sign Out
            </button>
        </div>
    );
};

export default Dashboard;
