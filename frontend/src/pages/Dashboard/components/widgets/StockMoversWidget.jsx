import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';

const StockMoversWidget = () => {
    const [activeTab, setActiveTab] = useState('gainers');

    const gainers = [
        { symbol: 'ADANIENT', name: 'Adani Enterprises', price: 2890.45, change: 5.4, volume: '2.4M' },
        { symbol: 'TATASTEEL', name: 'Tata Steel', price: 156.70, change: 3.2, volume: '12M' },
        { symbol: 'INFY', name: 'Infosys', price: 1670.30, change: 2.1, volume: '4.5M' },
        { symbol: 'RELIANCE', name: 'Reliance Ind', price: 2750.00, change: 1.8, volume: '3.1M' },
        { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1680.50, change: 1.5, volume: '8.2M' },
    ];

    const losers = [
        { symbol: 'WIPRO', name: 'Wipro Ltd', price: 450.20, change: -4.2, volume: '3.4M' },
        { symbol: 'TECHM', name: 'Tech Mahindra', price: 1240.50, change: -3.1, volume: '1.2M' },
        { symbol: 'SBIN', name: 'SBI', price: 630.15, change: -1.9, volume: '15M' },
        { symbol: 'LT', name: 'Larsen & Toubro', price: 3450.00, change: -1.2, volume: '900K' },
        { symbol: 'BAJFIN', name: 'Bajaj Finance', price: 7200.00, change: -0.8, volume: '500K' },
    ];

    const data = activeTab === 'gainers' ? gainers : losers;

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>Stock Movers</h3>
                    <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' }}>
                        {['gainers', 'losers'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: activeTab === tab ? 'var(--color-accent)' : 'transparent',
                                    color: activeTab === tab ? '#000' : 'var(--color-text-secondary)',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    textTransform: 'capitalize',
                                    fontWeight: activeTab === tab ? '600' : '400',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                <MoreHorizontal size={20} color="var(--color-text-secondary)" style={{ cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0.75rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    <span>Company</span>
                    <span>Price / Change</span>
                </div>
                {data.map((stock) => (
                    <div key={stock.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '8px',
                                backgroundColor: activeTab === 'gainers' ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 77, 77, 0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeTab === 'gainers' ? '#00C853' : '#FF4D4D'
                            }}>
                                {activeTab === 'gainers' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                            </div>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{stock.symbol}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{stock.name}</div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>₹{stock.price.toFixed(2)}</div>
                            <div style={{ fontSize: '0.8rem', color: activeTab === 'gainers' ? '#00C853' : '#FF4D4D', fontWeight: '500' }}>
                                {activeTab === 'gainers' ? '+' : ''}{stock.change}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500' }}>
                View all market movers
            </div>
        </div>
    );
};

export default StockMoversWidget;
