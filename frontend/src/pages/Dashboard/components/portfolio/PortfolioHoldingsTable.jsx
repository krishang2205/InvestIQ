import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

const PortfolioHoldingsTable = ({ data, sortConfig, onSort, onAddTransaction, onDeleteStock }) => {
    const [expandedRowId, setExpandedRowId] = useState(null);

    // Standard Grid for both Header and Rows to ensure perfect alignment
    const GRID_STYLE = {
        display: 'grid',
        gridTemplateColumns: 'minmax(140px, 2.2fr) 0.8fr 1.2fr 1.6fr 1.2fr 1.6fr 2fr 0.8fr',
        alignItems: 'center',
        padding: '0.75rem 1.5rem',
        gap: '0.5rem'
    };

    // Helper to render sort icon
    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={12} style={{ opacity: 0.3 }} />;
        return sortConfig.direction === 'ascending' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
    };

    const headers = [
        { key: 'ticker', label: 'Instrument', align: 'left' },
        { key: 'qty', label: 'Qty', align: 'right' },
        { key: 'avgPrice', label: 'Avg.', align: 'right' },
        { key: 'total_invested', label: 'Invested', align: 'right' },
        { key: 'ltp', label: 'LTP', align: 'right' },
        { key: 'current_value', label: 'Current', align: 'right' },
        { key: 'pnl', label: 'P&L', align: 'right' },
        { key: 'weight', label: 'Weight', align: 'right' },
    ];

    const formatCurrency = (val) => {
        if (val == null || isNaN(val)) return '₹0';
        return '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 });
    };

    return (
        <div className="glass-panel" style={{
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(20,20,20,0.4)',
            overflow: 'hidden',
            minWidth: '900px' // Ensure horizontal scroll on very small screens instead of squishing
        }}>
            {/* Header Row */}
            <div style={{
                ...GRID_STYLE,
                background: 'rgba(255,255,255,0.02)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                paddingTop: '1rem',
                paddingBottom: '1rem'
            }}>
                {headers.map((h) => (
                    <div
                        key={h.key}
                        onClick={() => onSort(h.key)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: h.align === 'right' ? 'flex-end' : 'flex-start',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: sortConfig.key === h.key ? '#D1C79D' : '#6b7280',
                            cursor: 'pointer',
                            userSelect: 'none',
                            textAlign: h.align
                        }}
                    >
                        {h.label}
                        {getSortIcon(h.key)}
                    </div>
                ))}
            </div>

            {/* Table Body */}
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {data.map((stock) => {
                    const investedValue = stock.total_invested ?? (stock.qty * stock.avgPrice);
                    const currentValue = stock.current_value ?? (stock.qty * stock.ltp);
                    const pnl = stock.pnl ?? (currentValue - investedValue);
                    const pnlPercent = stock.pnl_percent ?? ((pnl / (investedValue || 1)) * 100);
                    const isProfit = pnl >= 0;
                    const isExpanded = expandedRowId === stock.id;

                    return (
                        <div key={stock.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            {/* Main Row */}
                            <div
                                onClick={() => setExpandedRowId(isExpanded ? null : stock.id)}
                                style={{
                                    ...GRID_STYLE,
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                    background: isExpanded ? 'rgba(209, 199, 157, 0.03)' : 'transparent',
                                    paddingTop: '1.25rem',
                                    paddingBottom: '1.25rem'
                                }}
                                onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                                onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}
                            >
                                {/* Instrument */}
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: 700, color: 'white', fontSize: '0.925rem' }}>{stock.ticker}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stock.name}</div>
                                </div>

                                {/* Qty */}
                                <div style={{ textAlign: 'right', color: '#e5e7eb', fontWeight: 500 }}>{stock.qty}</div>

                                {/* Avg Price */}
                                <div style={{ textAlign: 'right', color: '#9ca3af', fontSize: '0.875rem' }}>{formatCurrency(stock.avgPrice)}</div>

                                {/* Invested Amount */}
                                <div style={{ textAlign: 'right', color: '#D1C79D', fontWeight: 600 }}>{formatCurrency(investedValue)}</div>

                                {/* LTP */}
                                <div style={{ textAlign: 'right', color: '#e5e7eb', fontSize: '0.875rem' }}>{formatCurrency(stock.ltp)}</div>

                                {/* Current Value */}
                                <div style={{ textAlign: 'right', color: 'white', fontWeight: 600 }}>{formatCurrency(currentValue)}</div>

                                {/* P&L */}
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: isProfit ? '#10b981' : '#f43f5e', fontWeight: 700, fontSize: '0.9rem' }}>
                                        {isProfit ? '+' : ''}{formatCurrency(pnl)}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: isProfit ? '#34d399' : '#fb7185', opacity: 0.8 }}>
                                        {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                                    </div>
                                </div>

                                {/* Weight */}
                                <div style={{ textAlign: 'right', color: '#6b7280', fontSize: '0.875rem' }}>{stock.weight}%</div>
                            </div>

                            {/* Expanded Detail View */}
                            {isExpanded && (
                                <div className="animate-in slide-in-from-top-2 duration-300" style={{
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    padding: '1.5rem',
                                    borderTop: '1px solid rgba(255,255,255,0.03)'
                                }}>
                                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                        {/* Performance Indicator (Real Sparkline) */}
                                        <div style={{ flex: '1 1 300px', height: '100px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem' }}>
                                            <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase' }}>7-Day Momentum</div>
                                            {stock.sparkline && stock.sparkline.length > 1 ? (
                                                <svg width="100%" height="50" viewBox="0 0 300 100" preserveAspectRatio="none">
                                                    {(() => {
                                                        const data = stock.sparkline;
                                                        const min = Math.min(...data);
                                                        const max = Math.max(...data);
                                                        const range = max - min || 1;
                                                        
                                                        // Generate Path Points
                                                        const points = data.map((val, i) => {
                                                            const x = (i / (data.length - 1)) * 300;
                                                            const y = 90 - ((val - min) / range) * 80; // 90 to 10 scale (inverted y)
                                                            return `${x},${y}`;
                                                        });
                                                        
                                                        // Smooth Cubic Bezier Path
                                                        const pathData = points.reduce((acc, point, i, a) => {
                                                            if (i === 0) return `M${point}`;
                                                            const prev = a[i - 1].split(',');
                                                            const curr = point.split(',');
                                                            const midX = (parseFloat(prev[0]) + parseFloat(curr[0])) / 2;
                                                            return `${acc} C${midX},${prev[1]} ${midX},${curr[1]} ${curr[0]},${curr[1]}`;
                                                        }, "");

                                                        return (
                                                            <path 
                                                                d={pathData} 
                                                                fill="none" 
                                                                stroke={isProfit ? '#10b981' : '#f43f5e'} 
                                                                strokeWidth="3" 
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        );
                                                    })()}
                                                </svg>
                                            ) : (
                                                <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontSize: '0.75rem' }}>
                                                    Loading momentum data...
                                                </div>
                                            )}
                                        </div>

                                        {/* Quick Controls */}
                                        <div style={{ flex: '0 0 350px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                                    <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>Day High</div>
                                                    <div style={{ color: 'white', fontWeight: 600 }}>{formatCurrency(stock.day_high)}</div>
                                                </div>
                                                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                                    <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>Day Low</div>
                                                    <div style={{ color: 'white', fontWeight: 600 }}>{formatCurrency(stock.day_low)}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                <button onClick={() => onAddTransaction?.({ symbol: stock.ticker, type: 'buy' })} style={{ flex: 1, padding: '0.6rem', background: '#D1C79D', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Buy More</button>
                                                <button onClick={() => onAddTransaction?.({ symbol: stock.ticker, type: 'sell' })} style={{ flex: 1, padding: '0.6rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Sell</button>
                                                <button onClick={() => onDeleteStock?.(stock.ticker)} style={{ padding: '0.6rem', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={18}/></button>
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
