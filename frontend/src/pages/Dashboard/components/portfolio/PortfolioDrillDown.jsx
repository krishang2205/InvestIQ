import React from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight } from 'lucide-react';

const PortfolioDrillDown = ({ onBack }) => {
    // Mock Data for Shell
    const stats = {
        invested: 1250000,
        current: 1420000,
        pnl: 170000,
        xirr: 18.5,
        cash: 45000,
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Header Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={onBack}
                    style={{
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.color = '#9ca3af';
                    }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', margin: 0 }}>Detailed Analysis</h1>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Deep dive into your holdings and performance.</p>
                </div>
            </div>

            {/* 2. Top Summary Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {/* Card A: Invested vs Current */}
                <div className="glass-panel" style={{
                    padding: '1.5rem',
                    borderRadius: '20px',
                    background: 'linear-gradient(145deg, rgba(30,30,30,0.6) 0%, rgba(20,20,20,0.8) 100%)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Gold Glow */}
                    <div style={{
                        position: 'absolute',
                        top: '-50%',
                        right: '-20%',
                        width: '200px',
                        height: '200px',
                        background: 'radial-gradient(circle, rgba(209, 199, 157, 0.1) 0%, transparent 70%)',
                        filter: 'blur(50px)',
                        pointerEvents: 'none'
                    }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Value</p>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white' }}>
                                ₹{stats.current.toLocaleString('en-IN')}
                            </h3>
                        </div>
                        <div style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '99px',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            color: '#10b981',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}>
                            <ArrowUpRight size={16} />
                            +{((stats.pnl / stats.invested) * 100).toFixed(2)}%
                        </div>
                    </div>

                    {/* Progress Bar Comparison */}
                    <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                            <span>Invested: ₹{stats.invested.toLocaleString('en-IN')}</span>
                            <span style={{ color: '#10b981' }}>+₹{stats.pnl.toLocaleString('en-IN')}</span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                            <div style={{ width: '85%', background: '#6b7280', height: '100%' }} /> {/* Invested Base */}
                            <div style={{ width: '15%', background: '#10b981', height: '100%' }} /> {/* Profit Gain */}
                        </div>
                    </div>
                </div>

                {/* Card B: XIRR */}
                <div className="glass-panel" style={{
                    padding: '1.5rem',
                    borderRadius: '20px',
                    background: 'rgba(30,30,30,0.4)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(209, 199, 157, 0.1)', borderRadius: '10px', color: '#D1C79D' }}>
                            <TrendingUp size={20} />
                        </div>
                        <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Annualized Return (XIRR)</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#D1C79D', lineHeight: '1' }}>
                        {stats.xirr}%
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        Outperforming Nifty 50 by 4.2%
                    </p>
                </div>

                {/* Card C: Cash Balance */}
                <div className="glass-panel" style={{
                    padding: '1.5rem',
                    borderRadius: '20px',
                    background: 'rgba(30,30,30,0.4)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }}>
                            <Wallet size={20} />
                        </div>
                        <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Available Margin</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'white' }}>
                        ₹{stats.cash.toLocaleString('en-IN')}
                    </div>
                    <div style={{ marginTop: '0.75rem' }}>
                        <button style={{
                            width: '100%',
                            padding: '0.5rem',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#e5e7eb',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}>
                            <DollarSign size={14} /> Add Funds
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. Placeholder for Table (Day 2) */}
            <div style={{
                height: '400px',
                border: '2px dashed rgba(255,255,255,0.1)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280'
            }}>
                Detailed Holdings Table Coming Soon...
            </div>
        </div>
    );
};

export default PortfolioDrillDown;
