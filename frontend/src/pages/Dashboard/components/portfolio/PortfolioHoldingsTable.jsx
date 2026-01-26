import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const PortfolioHoldingsTable = ({ data, sortConfig, onSort }) => {
    const [expandedRowId, setExpandedRowId] = useState(null);

    // Helper to render sort icon
    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
        return sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
    };

    const headers = [
        { key: 'ticker', label: 'Instrument' },
        { key: 'qty', label: 'Qty' },
        { key: 'avgPrice', label: 'Avg.' },
        { key: 'ltp', label: 'LTP' },
        { key: 'pnl', label: 'P&L' },
        { key: 'weight', label: 'Weight' },
    ];

    return (
        <div className="glass-panel" style={{
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(30,30,30,0.4)',
            overflow: 'hidden'
        }}>
            {/* Header Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)', // Using explicit 12-col grid for better control
                padding: '1rem 1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(255,255,255,0.02)'
            }}>
                {headers.map((header) => {
                    // Responsive Visibility Logic
                    const isHiddenOnMobile = ['avgPrice', 'weight'].includes(header.key);
                    const colSpan = header.key === 'ticker' ? 'col-span-4 md:col-span-3' :
                        isHiddenOnMobile ? 'hidden md:block md:col-span-2' :
                            'col-span-2';

                    return (
                        <div
                            key={header.key}
                            className={colSpan}
                            onClick={() => onSort(header.key)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: sortConfig.key === header.key ? '#D1C79D' : '#9ca3af',
                                cursor: 'pointer',
                                userSelect: 'none'
                            }}
                        >
                            {header.label}
                            {getSortIcon(header.key)}
                        </div>
                    );
                })}
            </div>

            {/* Table Body */}
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {data.map((stock) => {
                    const investedValue = stock.qty * stock.avgPrice;
                    const currentValue = stock.qty * stock.ltp;
                    const pnl = currentValue - investedValue;
                    const pnlPercent = (pnl / investedValue) * 100;
                    const isProfit = pnl >= 0;

                    const formatCurrency = (val) => '₹' + val.toLocaleString('en-IN', { maximumFractionDigits: 2 });


                    const isExpanded = expandedRowId === stock.id;

                    return (
                        <div key={stock.id}>
                            {/* Main Row */}
                            <div
                                onClick={() => setExpandedRowId(isExpanded ? null : stock.id)}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(12, 1fr)',
                                    padding: '1rem 1.5rem',
                                    borderBottom: isExpanded ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                    alignItems: 'center',
                                    transition: 'background 0.2s',
                                    cursor: 'pointer',
                                    background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent'
                                }}
                                onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                                onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}
                            >
                                {/* Ticker & Name - Span 4 on mobile, 3 on desktop */}
                                <div className="col-span-4 md:col-span-3">
                                    <div style={{ fontWeight: 700, color: 'white' }}>{stock.ticker}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{stock.name}</div>
                                </div>

                                {/* Qty - Span 2 */}
                                <div className="col-span-2" style={{ color: '#e5e7eb', fontWeight: 500 }}>{stock.qty}</div>

                                {/* Avg Price - Hidden on mobile, Span 2 on desktop */}
                                <div className="hidden md:block md:col-span-2" style={{ color: '#9ca3af' }}>{formatCurrency(stock.avgPrice)}</div>

                                {/* LTP - Span 2 */}
                                <div className="col-span-2" style={{ color: 'white', fontWeight: 600 }}>{formatCurrency(stock.ltp)}</div>

                                {/* P&L - Span 2 */}
                                <div className="col-span-3 md:col-span-2">
                                    <div style={{ color: isProfit ? '#10b981' : '#f43f5e', fontWeight: 600, fontSize: '0.9rem' }}>
                                        {isProfit ? '+' : ''}{formatCurrency(pnl)}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        display: 'inline-block',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        background: isProfit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                                        color: isProfit ? '#10b981' : '#f43f5e',
                                        marginTop: '2px'
                                    }}>
                                        {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                                    </div>
                                </div>

                                {/* Weight - Hidden on mobile, Span 1 on desktop */}
                                <div className="hidden md:block md:col-span-1" style={{ color: '#9ca3af' }}>{stock.weight}%</div>
                            </div>

                            {/* Expanded Detail View */}
                            {isExpanded && (
                                <div className="animate-in slide-in-from-top-2 duration-200" style={{
                                    background: 'rgba(20, 20, 20, 0.5)',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    padding: '1.5rem',
                                }}>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                        gap: '2rem'
                                    }}>
                                        {/* Left Col: Chart Placeholder */}
                                        <div style={{
                                            height: '120px',
                                            background: 'rgba(0,0,0,0.2)',
                                            borderRadius: '12px',
                                            padding: '1rem',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem' }}>7-Day Performance</div>
                                            {/* Simulated Sparkline SVG */}
                                            <svg width="100%" height="70%" viewBox="0 0 300 100" preserveAspectRatio="none">
                                                <path
                                                    d={isProfit
                                                        ? "M0,80 C50,80 50,40 100,50 C150,60 150,20 200,30 C250,40 250,0 300,10"
                                                        : "M0,20 C50,20 50,60 100,50 C150,40 150,80 200,70 C250,60 250,100 300,90"}
                                                    fill="none"
                                                    stroke={isProfit ? '#10b981' : '#f43f5e'}
                                                    strokeWidth="2"
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                                <defs>
                                                    <linearGradient id={`grad-${stock.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" stopColor={isProfit ? '#10b981' : '#f43f5e'} stopOpacity="0.2" />
                                                        <stop offset="100%" stopColor={isProfit ? '#10b981' : '#f43f5e'} stopOpacity="0" />
                                                    </linearGradient>
                                                </defs>
                                                <path
                                                    d={isProfit
                                                        ? "M0,80 C50,80 50,40 100,50 C150,60 150,20 200,30 C250,40 250,0 300,10 V100 H0 Z"
                                                        : "M0,20 C50,20 50,60 100,50 C150,40 150,80 200,70 C250,60 250,100 300,90 V100 H0 Z"}
                                                    fill={`url(#grad-${stock.id})`}
                                                    stroke="none"
                                                />
                                            </svg>
                                        </div>

                                        {/* Right Col: Quick Stats & Actions */}
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Day's High</p>
                                                    <p style={{ color: 'white', fontWeight: 600 }}>{formatCurrency(stock.ltp * 1.02)}</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Day's Low</p>
                                                    <p style={{ color: 'white', fontWeight: 600 }}>{formatCurrency(stock.ltp * 0.98)}</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>52W High</p>
                                                    <p style={{ color: 'white', fontWeight: 600 }}>{formatCurrency(stock.ltp * 1.4)}</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>52W Low</p>
                                                    <p style={{ color: 'white', fontWeight: 600 }}>{formatCurrency(stock.ltp * 0.7)}</p>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button style={{
                                                    flex: 1,
                                                    padding: '0.5rem',
                                                    background: '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}>Buy More</button>
                                                <button style={{
                                                    flex: 1,
                                                    padding: '0.5rem',
                                                    background: 'rgba(244, 63, 94, 0.1)',
                                                    color: '#f43f5e',
                                                    border: '1px solid rgba(244, 63, 94, 0.2)',
                                                    borderRadius: '8px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}>Sell</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PortfolioHoldingsTable;
