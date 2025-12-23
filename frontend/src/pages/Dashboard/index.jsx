
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

const Dashboard = () => {
    const { user, signOut } = useAuth();

    const [apiMessage, setApiMessage] = React.useState('');

    const testProtectedApi = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setApiMessage('No active session!');
                return;
            }

            const response = await fetch('http://localhost:5000/api/protected', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            const data = await response.json();
            setApiMessage(response.ok ? `Success: ${data.message}` : `Error: ${data.message}`);
        } catch (error) {
            setApiMessage(`Request failed: ${error.message}`);
        }
    };

    return (
        <div style={{ padding: '2rem', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Dashboard</h1>
            <p>Welcome, {user?.email}!</p>

            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                <h3>You are authenticated.</h3>
                <p>This is a protected area. Only logged-in users can see this.</p>
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}>
                <h3>Backend Connectivity Test</h3>
                <p style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '1rem' }}>
                    Click below to test the connection to the Flask Backend (ensure it is running on port 5000).
                </p>
                <button
                    onClick={testProtectedApi}
                    style={{
                        padding: '0.5rem 1rem',
                        background: '#10B981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '1rem'
                    }}
                >
                    Call Protected API
                </button>
                {apiMessage && <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{apiMessage}</p>}
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
