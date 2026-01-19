import React from 'react';
import { Wallet, Upload, Plus, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

const PortfolioEmptyState = ({ onAddTransaction }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '600px',
            padding: '1rem'
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gridTemplateRows: 'repeat(2, 280px)', // Fixed height rows for bento feel
                gap: '1.5rem',
                maxWidth: '1200px',
                width: '100%',
                margin: '0 auto'
            }}>
                {/* 1. Hero Tile: Connect Broker (Span 8 cols, 2 rows) */}
                <div style={{
                    gridColumn: 'span 8',
                    gridRow: 'span 2',
                    background: 'linear-gradient(135deg, rgba(209, 199, 157, 0.1) 0%, rgba(30, 30, 30, 0.4) 100%)',
                    borderRadius: '24px',
                    border: '1px solid rgba(209, 199, 157, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '3rem',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease',
                    backdropFilter: 'blur(10px)'
                }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {/* Abstract Gold Background Shape */}
                    <div style={{
                        position: 'absolute',
                        top: '-10%',
                        right: '-10%',
                        width: '400px',
                        height: '400px',
                        background: 'radial-gradient(circle, rgba(209, 199, 157, 0.15) 0%, transparent 70%)',
                        zIndex: 0,
                        pointerEvents: 'none',
                        filter: 'blur(80px)'
                    }} />

                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '999px',
                            backgroundColor: 'rgba(209, 199, 157, 0.1)',
                            border: '1px solid rgba(209, 199, 157, 0.2)',
                            color: '#D1C79D',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            marginBottom: '1.5rem'
                        }}>
                            <Sparkles size={16} /> Recommended for You
                        </div>
                        <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'white', lineHeight: '1.1', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                            Sync Your <br />
                            <span style={{
                                background: 'linear-gradient(to right, #D1C79D, #B0A678)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>Entire Wealth.</span>
                        </h2>
                        <p style={{ fontSize: '1.125rem', color: '#9ca3af', maxWidth: '480px', lineHeight: '1.6' }}>
                            Connect Zerodha, Groww, or Upstox to automatically track your equity, mutual funds, and gold in real-time. Safe, secure, and seamless.
                        </p>
                    </div>

                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <button style={{
                            padding: '1.25rem 2.5rem',
                            background: '#D1C79D',
                            color: '#000',
                            fontSize: '1.125rem',
                            fontWeight: 700,
                            borderRadius: '16px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            boxShadow: '0 10px 30px rgba(209, 199, 157, 0.2)',
                            transition: 'all 0.2s'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 15px 40px rgba(209, 199, 157, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(209, 199, 157, 0.2)';
                            }}
                        >
                            <Upload size={24} />
                            Connect Broker Account
                        </button>
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', opacity: 0.6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                                <ShieldCheck size={16} /> Bank-grade Encryption
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', fontSize: '0.875rem' }}>
                                <ShieldCheck size={16} /> ISO 27001 Certified
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Action Tile: Manual Entry (Span 4 cols, 1 row) */}
                <div style={{
                    gridColumn: 'span 4',
                    background: 'rgba(30, 30, 30, 0.4)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                    onClick={onAddTransaction}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(30, 30, 30, 0.4)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                    }}
                >
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(52, 211, 153, 0.1)', // Green tint
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem',
                        border: '1px solid rgba(52, 211, 153, 0.2)'
                    }}>
                        <Plus size={32} color="#34d399" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>Manual Entry</h3>
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: '1.5' }}>
                        Prefer to add assets yourself? <br /> Use our streamlined form.
                    </p>
                </div>

                {/* 3. Feature Tile: Teaser (Span 4 cols, 1 row) */}
                <div style={{
                    gridColumn: 'span 4',
                    background: 'linear-gradient(180deg, rgba(30, 30, 30, 0.4) 0%, rgba(20, 20, 20, 0.8) 100%)',
                    borderRadius: '24px',
                    border: '1px dashed rgba(255, 255, 255, 0.1)',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    <TrendingUp size={48} color="#6b7280" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.5rem' }}>AI Insights</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        Connect to unlock risk analysis and rebalancing tips.
                    </p>

                    {/* Blur Overlay Effect */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backdropFilter: 'blur(2px)',
                        background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.5))',
                        borderRadius: '24px',
                        pointerEvents: 'none'
                    }} />
                </div>
            </div>
        </div>
    );
};

export default PortfolioEmptyState;
