import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';

const StockRow = ({ stock, index, activeTab }) => {
    const isGain = activeTab === 'gainers';
    const color = isGain ? '#00C853' : '#FF4D4D';

    return (
        <div
            className="animate-fade-in"
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.02)',
                marginBottom: '0.5rem',
                border: '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                animationDelay: `${index * 50}ms`
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                e.currentTarget.style.borderColor = 'transparent';
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    backgroundColor: isGain ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 77, 77, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: color
                }}>
                    {isGain ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                </div>
                <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{stock.symbol}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{stock.name}</div>
                </div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>₹{stock.price.toFixed(2)}</div>
                <div style={{ fontSize: '0.8rem', color: color, fontWeight: '600' }}>
                    {isGain ? '+' : ''}{stock.change}%
                </div>
            </div>
        </div>
    );
};

const LoadingSkeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
                height: '60px',
                width: '100%',
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: '12px',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }}>
                <div className="skeleton-pulse" style={{ width: '40px', height: '40px' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div className="skeleton-pulse" style={{ width: '60px', height: '14px' }} />
                    <div className="skeleton-pulse" style={{ width: '100px', height: '12px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                    <div className="skeleton-pulse" style={{ width: '50px', height: '14px' }} />
                    <div className="skeleton-pulse" style={{ width: '40px', height: '12px' }} />
                </div>
            </div>
        ))}
    </div>
);

const StockMoversWidget = () => {
    const [activeTab, setActiveTab] = useState('gainers');
    const [isLoading, setIsLoading] = useState(false);
    const [displayData, setDisplayData] = useState([]);

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

    // Simulate data fetch on tab change
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setDisplayData(activeTab === 'gainers' ? gainers : losers);
            setIsLoading(false);
        }, 600); // 600ms load time
        return () => clearTimeout(timer);
    }, [activeTab]);

    return (
        <div className="glass-panel shadow-soft-lift" style={{
            padding: '1.5rem',
            borderRadius: '16px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>Stock Movers</h3>

                    {/* Pill Tabs */}
                    <div style={{
                        display: 'flex',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderRadius: '20px', // Fully rounded
                        padding: '3px'
                    }}>
                        {['gainers', 'losers'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '0.35rem 1rem',
                                    borderRadius: '16px',
                                    border: 'none',
                                    backgroundColor: activeTab === tab ? 'var(--color-accent)' : 'transparent',
                                    color: activeTab === tab ? '#000' : 'var(--color-text-secondary)',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    textTransform: 'capitalize',
                                    fontWeight: activeTab === tab ? '600' : '500',
                                    transition: 'all 0.2s ease',
                                    boxShadow: activeTab === tab ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                <MoreHorizontal size={20} color="var(--color-text-secondary)" style={{ cursor: 'pointer' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '300px' }}>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 1rem 0.5rem 1rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    <span>Company</span>
                    <span>Price / Change</span>
                </div>

                {isLoading ? (
                    <LoadingSkeleton />
                ) : (
                    <div className="custom-scrollbar" style={{ overflowY: 'auto', flex: 1 }}>
                        {displayData.map((stock, idx) => (
                            <StockRow key={stock.symbol} stock={stock} index={idx} activeTab={activeTab} />
                        ))}
                    </div>
                )}
            </div>

            <div style={{
                marginTop: '1rem',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                fontWeight: '600',
                padding: '0.5rem',
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }}>
                View all market movers
            </div>
        </div>
    );
};

export default StockMoversWidget;
