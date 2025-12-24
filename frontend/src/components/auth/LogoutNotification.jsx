import React from 'react';
// Using inline styles to ensure it works without complex CSS dependencies first
// Adapting styles to match the 'Midnight Gold' theme

const LogoutNotification = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
        }}>
            <div className="glass-panel" style={{
                padding: '3rem',
                borderRadius: '24px',
                textAlign: 'center',
                maxWidth: '400px',
                border: '1px solid var(--color-accent)',
                boxShadow: '0 0 30px rgba(209, 199, 157, 0.2)'
            }}>
                <h2 className="text-gradient-gold" style={{
                    fontSize: '2rem',
                    marginBottom: '1rem',
                    fontWeight: 700
                }}>Thank You</h2>
                <p style={{
                    color: 'var(--color-primary)',
                    fontSize: '1.2rem',
                    marginBottom: '0.5rem'
                }}>
                    You have been securely logged out.
                </p>
                <p style={{
                    color: 'var(--color-secondary)',
                    fontSize: '0.9rem'
                }}>
                    Redirecting to home in 5 seconds...
                </p>
            </div>
        </div>
    );
};

export default LogoutNotification;
