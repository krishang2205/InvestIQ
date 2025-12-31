import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, ChevronDown } from 'lucide-react';

const StockRow = ({ stock, index, activeTab }) => {
    // Determine if positive based on tab concept or explicit change value
    // For 'Losers' and '52W Low', trends are negative (Red)
    // For 'Gainers', 'Most Active', '52W High', trends depend on value (usually Green)

    // Simplistic logic: if change is >= 0, Green. Else Red.
    const isGain = stock.change >= 0;
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
    const tabs = ['Gainers', 'Losers', 'Most Active', '52W High', '52W Low'];
    const [activeTab, setActiveTab] = useState('Gainers');
    const [activeCap, setActiveCap] = useState('Large Cap');
    const [isLoading, setIsLoading] = useState(false);
    const [displayData, setDisplayData] = useState([]);

    // Mock Data Sets
    const mockData = {
        'Gainers': [
            { symbol: 'ADANIENT', name: 'Adani Enterprises', price: 2890.45, change: 5.4 },
            { symbol: 'TATASTEEL', name: 'Tata Steel', price: 156.70, change: 3.2 },
            { symbol: 'INFY', name: 'Infosys', price: 1670.30, change: 2.1 },
            { symbol: 'RELIANCE', name: 'Reliance Ind', price: 2750.00, change: 1.8 },
            { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1680.50, change: 1.5 },
        ],
        'Losers': [
            { symbol: 'WIPRO', name: 'Wipro Ltd', price: 450.20, change: -4.2 },
            { symbol: 'TECHM', name: 'Tech Mahindra', price: 1240.50, change: -3.1 },
            { symbol: 'SBIN', name: 'SBI', price: 630.15, change: -1.9 },
            { symbol: 'LT', name: 'Larsen & Toubro', price: 3450.00, change: -1.2 },
            { symbol: 'BAJFIN', name: 'Bajaj Finance', price: 7200.00, change: -0.8 },
        ],
        'Most Active': [
            { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1680.50, change: 1.5 },
            { symbol: 'RELIANCE', name: 'Reliance Ind', price: 2750.00, change: 1.8 },
            { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 990.00, change: 0.5 },
            { symbol: 'SBIN', name: 'SBI', price: 630.15, change: -1.9 },
            { symbol: 'TATAMOTORS', name: 'Tata Motors', price: 810.20, change: 1.2 },
        ],
        '52W High': [
            { symbol: 'COALINDIA', name: 'Coal India', price: 380.00, change: 2.5 },
            { symbol: 'NTPC', name: 'NTPC Ltd', price: 310.00, change: 1.1 },
            { symbol: 'POWERGRID', name: 'Power Grid Corp', price: 240.00, change: 0.9 },
            { symbol: 'ONGC', name: 'ONGC', price: 220.00, change: 1.8 },
            { symbol: 'HAL', name: 'Hindustan Aeronautics', price: 2900.00, change: 3.5 },
        ],
        '52W Low': [
            { symbol: 'HUL', name: 'Hindustan Unilever', price: 2400.00, change: -0.5 },
            { symbol: 'ASIANPAINT', name: 'Asian Paints', price: 2900.00, change: -1.1 },
            { symbol: 'UPL', name: 'UPL Ltd', price: 550.00, change: -2.3 },
            { symbol: 'AUBANK', name: 'AU Small Finance', price: 680.00, change: -1.5 },
            { symbol: 'BANDHANBNK', name: 'Bandhan Bank', price: 210.00, change: -0.9 },
        ]
    };

    // Simulate data fetch on tab change
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setDisplayData(mockData[activeTab] || []);
            setIsLoading(false);
        }, 500); // 500ms load time
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
            {/* Header Row: Title & Tabs & Cap Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>Stock Movers</h3>

                    {/* Cap Selector Dropdown - Simple Text Button for now */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: 'var(--color-accent)',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}>
                        {activeCap} <ChevronDown size={16} />
                    </div>
                </div>

                {/* Pill Tabs Container - Scrollable if needed */}
                <div className="custom-scrollbar" style={{
                    display: 'flex',
                    gap: '0.5rem',
                    overflowX: 'auto',
                    paddingBottom: '0.5rem'
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '0.4rem 1rem',
                                borderRadius: '20px',
                                border: '1px solid',
                                borderColor: activeTab === tab ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                                backgroundColor: activeTab === tab ? 'var(--color-accent)' : 'transparent',
                                color: activeTab === tab ? '#000' : 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                whiteSpace: 'nowrap',
                                fontWeight: activeTab === tab ? '600' : '500',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {/* Icons could be added here similar to reference */}
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '300px' }}>
                {/* Table Header Row */}
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
