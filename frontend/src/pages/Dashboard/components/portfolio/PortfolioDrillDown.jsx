import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Sparkles, Lock, BarChart2, PieChart, ShieldCheck } from 'lucide-react';
import PortfolioHoldingsTable from './PortfolioHoldingsTable';
import PortfolioSectorAlloc from './PortfolioSectorAlloc';
import PortfolioMarketCap from './PortfolioMarketCap';

const PortfolioDrillDown = ({ onBack, holdings, summary, xirr, onAddTransaction, onDeleteStock }) => {
    const stats = {
        invested: summary?.total_invested ?? 0,
        current: summary?.total_value ?? 0,
        pnl: summary?.pnl ?? 0,
        xirr: xirr?.xirr ?? 0,
        cash: 0,
    };

    const [sortConfig, setSortConfig] = useState({ key: 'weight', direction: 'descending' });

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = [...(holdings || [])].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', margin: 0 }}>Detailed Analysis</h1>
                        <span style={{ 
                            fontSize: '0.625rem', 
                            backgroundColor: 'rgba(209, 199, 157, 0.1)', 
                            color: '#D1C79D', 
                            padding: '0.25rem 0.75rem', 
                            borderRadius: '99px', 
                            border: '1px solid rgba(209, 199, 157, 0.2)',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}>
                            <Sparkles size={10} />
                            PREMIUM
                        </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Institutional-Grade Structural Diagnostics & Insights.</p>
                </div>
            </div>

            {/* 2. Top Summary Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white', margin: 0 }}>
                                ₹{stats.current.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </h3>
                        </div>
                        <div style={{
                            padding: '0.5rem 1rem',
                            background: stats.pnl >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                            borderRadius: '99px',
                            border: `1px solid ${stats.pnl >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`,
                            color: stats.pnl >= 0 ? '#10b981' : '#f43f5e',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}>
                            {stats.pnl >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            {stats.pnl >= 0 ? '+' : ''}{((stats.pnl / (stats.invested || 1)) * 100).toFixed(2)}%
                        </div>
                    </div>

                    {/* Progress Bar Comparison */}
                    <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                            <span>Invested: ₹{stats.invested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                            <span style={{ color: stats.pnl >= 0 ? '#10b981' : '#f43f5e' }}>
                                {stats.pnl >= 0 ? '+' : ''}₹{stats.pnl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                            <div style={{ 
                                width: `${stats.current > 0 ? (stats.invested / Math.max(stats.invested, stats.current)) * 100 : 100}%`, 
                                background: '#6b7280', 
                                height: '100%',
                                transition: 'width 0.5s ease-in-out'
                            }} />
                            <div style={{ 
                                width: `${stats.current > 0 ? (Math.abs(stats.pnl) / Math.max(stats.invested, stats.current)) * 100 : 0}%`, 
                                background: stats.pnl >= 0 ? '#10b981' : '#f43f5e', 
                                height: '100%',
                                transition: 'width 0.5s ease-in-out'
                            }} />
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
                        <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                            {xirr?.xirr_type === 'absolute' ? 'Absolute Return' : 'Annualized Return (XIRR)'}
                        </span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#D1C79D', lineHeight: '1' }}>
                        {Number(stats.xirr || 0).toFixed(2)}%
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        Alpha vs Nifty 50: {xirr?.alpha != null ? `${xirr.alpha}%` : '--'}
                        {xirr?.xirr_type === 'absolute' && <span style={{ marginLeft: '4px', opacity: 0.7 }}>(Absolute)</span>}
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

            {/* 3. Holdings Table */}
            <div style={{ marginBottom: '2rem', overflowX: 'auto' }}>
                <PortfolioHoldingsTable
                    data={sortedData}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    onAddTransaction={onAddTransaction}
                    onDeleteStock={onDeleteStock}
                />
            </div>

            {/* 4. Insights Grid (Day 5 & 6) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Day 5: Sector Allocation */}
                <PortfolioSectorAlloc data={sortedData} />

                {/* Day 6: Market Cap Analysis */}
                <PortfolioMarketCap data={sortedData} />
            </div>

            {/* 5. Premium Institutional Scans (Locked) */}
            <div style={{ padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden', marginBottom: '4rem' }}>
                <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(12px)', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
                    <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        borderRadius: '50%', 
                        background: 'rgba(209, 199, 157, 0.1)', 
                        border: '1px solid rgba(209, 199, 157, 0.3)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#D1C79D',
                        marginBottom: '1.5rem'
                    }}>
                        <Lock size={32} />
                    </div>
                    <h2 className="text-gradient-gold" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>Professional Yield Optimizers</h2>
                    <p style={{ color: '#9ca3af', maxWidth: '600px', marginBottom: '2rem', lineHeight: '1.6' }}>
                        Unlock specialized institutional tools including Tax-Loss Harvesting suggestions, Dividend Forecast Calendars, and Asset Correlation Heatmaps to fine-tune your portfolio architecture.
                    </p>
                    <button style={{ 
                        padding: '1rem 3rem', 
                        background: 'linear-gradient(135deg, #D1C79D 0%, #B0A678 100%)', 
                        color: 'black', 
                        borderRadius: '99px', 
                        fontWeight: 700, 
                        border: 'none', 
                        cursor: 'pointer',
                        boxShadow: '0 8px 16px rgba(209, 199, 157, 0.2)'
                    }}>
                        Upgrade to Premium
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', opacity: 0.3 }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', height: '200px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                        <ShieldCheck size={40} color="#9ca3af" />
                        <span style={{ color: '#6b7280', fontWeight: 600 }}>Correlation Heatmap</span>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.5rem', height: '200px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                        <BarChart2 size={40} color="#9ca3af" />
                        <span style={{ color: '#6b7280', fontWeight: 600 }}>Dividend Forecast Pro</span>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.5rem', height: '200px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                        <PieChart size={40} color="#9ca3af" />
                        <span style={{ color: '#6b7280', fontWeight: 600 }}>Tax Loss Harvester</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortfolioDrillDown;
