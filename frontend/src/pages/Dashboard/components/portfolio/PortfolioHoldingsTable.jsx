import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const PortfolioHoldingsTable = ({ data, sortConfig, onSort }) => {
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
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(255,255,255,0.02)'
            }}>
                {headers.map((header) => (
                    <div
                        key={header.key}
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
                ))}
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

                    return (
                        <div
                            key={stock.id}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                                padding: '1rem 1.5rem',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                alignItems: 'center',
                                transition: 'background 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            {/* Ticker & Name */}
                            <div>
                                <div style={{ fontWeight: 700, color: 'white' }}>{stock.ticker}</div>
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{stock.name}</div>
                            </div>

                            {/* Qty */}
                            <div style={{ color: '#e5e7eb', fontWeight: 500 }}>{stock.qty}</div>

                            {/* Avg Price */}
                            <div style={{ color: '#9ca3af' }}>{formatCurrency(stock.avgPrice)}</div>

                            {/* LTP */}
                            <div style={{ color: 'white', fontWeight: 600 }}>{formatCurrency(stock.ltp)}</div>

                            {/* P&L */}
                            <div>
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

                            {/* Weight */}
                            <div style={{ color: '#9ca3af' }}>{stock.weight}%</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PortfolioHoldingsTable;
