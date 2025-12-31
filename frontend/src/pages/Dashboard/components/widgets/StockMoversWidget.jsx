import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, ChevronDown } from 'lucide-react';

const StockRow = ({ stock, index, activeTab, logo }) => {
    const isGain = stock.change >= 0;
    const color = isGain ? '#00C853' : '#FF4D4D';

    return (
        <div
            className="animate-fade-in"
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem', // Aesthetic Padding
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
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '6px' // Padding for the logo
                }}>
                    {logo ? (
                        <img
                            src={logo}
                            alt={stock.symbol}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => {
                                e.target.style.display = 'none'; // Hide if fails
                                e.target.parentElement.innerHTML = isGain ? '<svg...>' : '<svg...>'; // simplified fallback
                            }}
                        />
                    ) : (
                        <div style={{ color: color }}>
                            {isGain ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                        </div>
                    )}
                </div>
                <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '2px' }}>{stock.symbol}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{stock.name}</div>
                </div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>₹{stock.price.toFixed(2)}</div>
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

    // Dropdown State
    const [activeCap, setActiveCap] = useState('Large Cap');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    const [displayData, setDisplayData] = useState([]);

    // Mock Data
    const mockData = {
        'Gainers': [
            { symbol: 'ADANIENT', name: 'Adani Enterprises', price: 2890.45, change: 5.4 },
            { symbol: 'TATASTEEL', name: 'Tata Steel', price: 156.70, change: 3.2 },
            { symbol: 'INFY', name: 'Infosys', price: 1670.30, change: 2.1 },
            { symbol: 'RELIANCE', name: 'Reliance Ind', price: 2750.00, change: 1.8 },
            { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1680.50, change: 1.5 },
        ],
        // ... (Other data same as before, simplified for this replace)
        'Losers': [{ symbol: 'WIPRO', name: 'Wipro Ltd', price: 450.20, change: -4.2 }, { symbol: 'TECHM', name: 'Tech Mahindra', price: 1240.50, change: -3.1 }],
        'Most Active': [{ symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1680.50, change: 1.5 }, { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 990.00, change: 0.5 }],
        '52W High': [{ symbol: 'COALINDIA', name: 'Coal India', price: 380.00, change: 2.5 }, { symbol: 'NTPC', name: 'NTPC Ltd', price: 310.00, change: 1.1 }],
        '52W Low': [{ symbol: 'HUL', name: 'Hindustan Unilever', price: 2400.00, change: -0.5 }, { symbol: 'UPL', name: 'UPL Ltd', price: 550.00, change: -2.3 }]
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setDisplayData(mockData[activeTab] || []);
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [activeTab]);

    // Logo Mapping using Google Favicon API for reliability
    const logoMap = {
        'ADANIENT': 'https://www.google.com/s2/favicons?domain=adani.com&sz=128',
        'TATASTEEL': 'https://www.google.com/s2/favicons?domain=tatasteel.com&sz=128',
        'INFY': 'https://www.google.com/s2/favicons?domain=infosys.com&sz=128',
        'RELIANCE': 'https://www.google.com/s2/favicons?domain=ril.com&sz=128',
        'HDFCBANK': 'https://www.google.com/s2/favicons?domain=hdfcbank.com&sz=128',
        'WIPRO': 'https://www.google.com/s2/favicons?domain=wipro.com&sz=128',
        'TECHM': 'https://www.google.com/s2/favicons?domain=techmahindra.com&sz=128',
        'COALINDIA': 'https://www.google.com/s2/favicons?domain=coalindia.in&sz=128',
        'NTPC': 'https://www.google.com/s2/favicons?domain=ntpc.co.in&sz=128',
        'HUL': 'https://www.google.com/s2/favicons?domain=hul.co.in&sz=128',
        'UPL': 'https://www.google.com/s2/favicons?domain=upl-ltd.com&sz=128',
        'ICICIBANK': 'https://www.google.com/s2/favicons?domain=icicibank.com&sz=128',
        'KOTAK': 'https://www.google.com/s2/favicons?domain=kotak.com&sz=128'
    };

    return (
        <div
            className="glass-panel shadow-soft-lift"
            style={{
                padding: '1.25rem', // Aesthetic Padding
                borderRadius: '16px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderTop: '1px solid rgba(255,255,255,0.1)'
            }}
        >
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>Stock Movers</h3>

                    {/* Functional Dropdown */}
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                        <div
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                color: 'var(--color-accent)',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                backgroundColor: isDropdownOpen ? 'rgba(255,255,255,0.05)' : 'transparent'
                            }}
                        >
                            {activeCap} <ChevronDown size={14} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                        </div>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="shadow-soft-lift" style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '0.5rem',
                                backgroundColor: '#1E1E1E',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                padding: '0.5rem',
                                zIndex: 50,
                                minWidth: '120px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px'
                            }}>
                                {['Large Cap', 'Mid Cap', 'Small Cap'].map(cap => (
                                    <div
                                        key={cap}
                                        onClick={() => { setActiveCap(cap); setIsDropdownOpen(false); }}
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            fontSize: '0.8rem',
                                            color: activeCap === cap ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                            backgroundColor: activeCap === cap ? 'rgba(255,255,255,0.05)' : 'transparent',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: activeCap === cap ? '600' : '400'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = activeCap === cap ? 'rgba(255,255,255,0.05)' : 'transparent'}
                                    >
                                        {cap}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="custom-scrollbar" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '0.4rem 1rem', // Balanced button size
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
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '0' }}> {/* minHeight 0 allows flex shrink */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0.5rem 0.5rem 0.5rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                    <span>Company</span>
                    <span>Price / Change</span>
                </div>
                {isLoading ? <LoadingSkeleton /> : (
                    <div className="custom-scrollbar" style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
                        {displayData.map((stock, idx) => (
                            <StockRow key={stock.symbol} stock={stock} index={idx} activeTab={activeTab} logo={logoMap[stock.symbol]} />
                        ))}
                    </div>
                )}
            </div>

            <div style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '600', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                View all market movers
            </div>
        </div>
    );
};

export default StockMoversWidget;
