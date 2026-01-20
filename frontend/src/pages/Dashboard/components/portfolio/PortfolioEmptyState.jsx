import React from 'react';
import { Wallet, Upload, Plus, Sparkles, TrendingUp, ShieldCheck, Lock } from 'lucide-react';

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
                gridTemplateRows: 'repeat(2, 280px)',
                gap: '1.5rem',
                maxWidth: '1200px',
                width: '100%',
                margin: '0 auto'
            }}>
                {/* 1. Hero Tile: Connect Broker (Locked/Premium) */}
                <div style={{
                    gridColumn: 'span 8',
                    gridRow: 'span 2',
                    background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.6) 0%, rgba(20, 20, 20, 0.8) 100%)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '3rem',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Locked Overlay Pattern */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                        opacity: 0.5,
                        pointerEvents: 'none'
                    }} />

                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '999px',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)', // Amber/Gold tint for Premium
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            color: '#F59E0B',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            marginBottom: '1.5rem'
                        }}>
                            <Lock size={16} /> Premium Feature
                        </div>
                        <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', lineHeight: '1.1', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                            Sorry, nothing in <br />
                            portfolio yet.
                        </h2>
                        <p style={{ fontSize: '1.125rem', color: '#6b7280', maxWidth: '480px', lineHeight: '1.6' }}>
                            Automate your tracking with <span style={{ color: '#D1C79D', fontWeight: 600 }}>InvestIQ Premium</span>. Connect Zerodha, Groww, or Upstox for real-time sync.
                        </p>
                    </div>

                    <div style={{ position: 'relative', zIndex: 10, opacity: 0.5, filter: 'grayscale(100%)' }}>
                        <button style={{
                            padding: '1.25rem 2.5rem',
                            background: '#333',
                            color: '#999',
                            fontSize: '1.125rem',
                            fontWeight: 700,
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            cursor: 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }} disabled>
                            <Upload size={24} />
                            Connect Broker Account
                        </button>
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                                <ShieldCheck size={16} /> Bank-grade Encryption
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Action Tile: Manual Entry (Prominent Free Option) */}
                <div style={{
                    gridColumn: 'span 4',
                    background: 'linear-gradient(135deg, rgba(209, 199, 157, 0.1) 0%, rgba(30, 30, 30, 0.4) 100%)', // Gold tint moved here
                    borderRadius: '24px',
                    border: '1px solid rgba(209, 199, 157, 0.3)', // brighter border
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
                    onClick={onAddTransaction}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.6)';
                        e.currentTarget.style.borderColor = '#D1C79D';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
                        e.currentTarget.style.borderColor = 'rgba(209, 199, 157, 0.3)';
                    }}
                >
                    {/* Gold Glow Effect */}
                    <div style={{
                        position: 'absolute',
                        top: '-20%',
                        right: '-20%',
                        width: '200px',
                        height: '200px',
                        background: 'radial-gradient(circle, rgba(209, 199, 157, 0.2) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                        zIndex: 0,
                    }} />

                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            backgroundColor: '#D1C79D', // Solid Gold
                            color: 'black',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.5rem',
                            boxShadow: '0 0 20px rgba(209, 199, 157, 0.3)'
                        }}>
                            <Plus size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Add Manually</h3>
                        <p style={{ color: '#d1d5db', fontSize: '1rem', lineHeight: '1.5' }}>
                            Start tracking your assets for free. The classic way to build wealth.
                        </p>
                        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#D1C79D', fontWeight: 600, fontSize: '0.875rem' }}>
                            Get Started →
                        </div>
                    </div>
                </div>

                {/* 3. Feature Tile: Teaser */}
                <div style={{
                    gridColumn: 'span 4',
                    background: 'rgba(30, 30, 30, 0.4)',
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
                        Unlock advanced analytics with Premium.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PortfolioEmptyState;
