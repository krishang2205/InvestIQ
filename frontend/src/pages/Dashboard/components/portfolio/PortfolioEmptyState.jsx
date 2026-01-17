import React from 'react';
import { Wallet, Upload, Plus } from 'lucide-react';

const PortfolioEmptyState = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '600px',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <div className="glass-panel" style={{
                maxWidth: '600px',
                width: '100%',
                padding: '3rem',
                borderRadius: '16px',
                border: '1px solid var(--glass-border)',
                background: 'linear-gradient(180deg, rgba(30, 30, 30, 0.6) 0%, rgba(20, 20, 20, 0.8) 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative Background */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(209, 199, 157, 0.1) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }} />

                <div style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(209, 199, 157, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem auto',
                        border: '1px solid rgba(209, 199, 157, 0.2)',
                        boxShadow: '0 0 20px rgba(209, 199, 157, 0.1)'
                    }}>
                        <Wallet size={40} color="#D1C79D" />
                    </div>

                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>
                        Start Your Wealth Journey
                    </h2>
                    <p style={{ fontSize: '1rem', color: '#9ca3af', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                        Connect your demat account to get AI-powered insights tailored for the <br />
                        <span style={{ color: '#D1C79D', fontWeight: 500 }}>Indian Stock Market</span>.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                        <button style={{
                            width: '100%',
                            maxWidth: '320px',
                            padding: '0.875rem 1.5rem',
                            background: 'linear-gradient(135deg, #D1C79D 0%, #B0A678 100%)',
                            borderRadius: '0.75rem',
                            fontSize: '1rem',
                            color: '#000',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            boxShadow: '0 4px 12px rgba(209, 199, 157, 0.2)',
                            transition: 'transform 0.2s'
                        }}
                            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            <Upload size={20} />
                            Connect Broker (Zerodha / Groww)
                        </button>

                        <button style={{
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '0.75rem',
                            padding: '0.875rem 1.5rem',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            width: '100%',
                            maxWidth: '320px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'background-color 0.2s'
                        }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            <Plus size={16} />
                            Add Transactions Manually
                        </button>
                    </div>

                    <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#6b7280' }}>
                        Your data is encrypted and secure. We are ISO 27001 certified.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PortfolioEmptyState;
