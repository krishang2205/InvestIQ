import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, ChevronDown, ArrowUpCircle, ArrowDownCircle, Flame, TrendingUp, TrendingDown } from 'lucide-react';
import useMarketData from '../../../../hooks/useMarketData';

import { StockRow } from './StockMoversComponents';

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

    // Fetch real movers data
    // Note: API currently provides 'gainers' and 'losers'. 
    // 'Most Active', '52W High', '52W Low' are not yet endpoints, so we might need to fallback or hide them for now.
    // For this step, we map 'Gainers' -> api.gainers, 'Losers' -> api.losers.
    const { data: moversData, loading: isLoading } = useMarketData('movers', 300000); // 5 min refresh

    const [displayData, setDisplayData] = useState([]);

    // Mock Data Fallback for unimplemented tabs to keep UI functional
    const mockDataFallback = {
        'Most Active': [{ symbol: 'HDFCBANK.NS', name: 'HDFC Bank', price: 1680.50, change: 1.5 }, { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', price: 990.00, change: 0.5 }],
        '52W High': [{ symbol: 'COALINDIA.NS', name: 'Coal India', price: 380.00, change: 2.5 }, { symbol: 'NTPC.NS', name: 'NTPC Ltd', price: 310.00, change: 1.1 }],
        '52W Low': [{ symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever', price: 2400.00, change: -0.5 }, { symbol: 'UPL.NS', name: 'UPL Ltd', price: 550.00, change: -2.3 }]
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
        if (isLoading) return;

        if (activeTab === 'Gainers') {
            setDisplayData(moversData?.gainers || []);
        } else if (activeTab === 'Losers') {
            setDisplayData(moversData?.losers || []);
        } else {
            // Fallback for tabs not yet in API
            setDisplayData(mockDataFallback[activeTab] || []);
        }
    }, [activeTab, moversData, isLoading]);

    // Logo Mapping using Google Favicon API for reliability
    const getLogo = (symbol) => {
        // Simple mapping based on known symbols, or try to guess domain
        const cleanSymbol = symbol.replace('.NS', '').replace('.BO', '');
        const domains = {
            'ADANIENT': 'adani.com',
            'TATASTEEL': 'tatasteel.com',
            'INFY': 'infosys.com',
            'RELIANCE': 'ril.com',
            'HDFCBANK': 'hdfcbank.com',
            'WIPRO': 'wipro.com',
            'TECHM': 'techmahindra.com',
            'COALINDIA': 'coalindia.in',
            'NTPC': 'ntpc.co.in',
            'HINDUNILVR': 'hul.co.in', 'HUL': 'hul.co.in',
            'UPL': 'upl-ltd.com',
            'ICICIBANK': 'icicibank.com',
            'KOTAKBANK': 'kotak.com',
            'SBIN': 'sbi.co.in',
            'ITC': 'itcportal.com',
            'LT': 'larsentoubro.com',
            'AXISBANK': 'axisbank.com',
            'MARUTI': 'marutisuzuki.com',
            'TITAN': 'titan.co.in',
            'ULTRACEMCO': 'ultratechcement.com',
            'SUNPHARMA': 'sunpharma.com',
            'NESTLEIND': 'nestle.in',
            'M&M': 'mahindra.com',
            'POWERGRID': 'powergrid.in',
            'JSWSTEEL': 'jsw.in',
            'HCLTECH': 'hcltech.com',
            'ADANIPORTS': 'adaniports.com',
            'ONGC': 'ongcindia.com',
            'BAJFINANCE': 'bajajfinserv.in',
            'ASIANPAINT': 'asianpaints.com',
            'BHARTIARTL': 'airtel.in'
        };

        const domain = domains[cleanSymbol];
        if (domain) return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        return null;
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

                <div className="custom-scrollbar" style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                    {tabs.map(tab => {
                        let Icon = null;
                        let iconColor = 'inherit';

                        if (tab === 'Gainers') { Icon = ArrowUpCircle; iconColor = '#00C853'; }
                        else if (tab === 'Losers') { Icon = ArrowDownCircle; iconColor = '#FF4D4D'; }
                        else if (tab === 'Most Active') { Icon = Flame; iconColor = '#FFA726'; }
                        else if (tab === '52W High') { Icon = TrendingUp; iconColor = '#00C853'; }
                        else if (tab === '52W Low') { Icon = TrendingDown; iconColor = '#FF4D4D'; }

                        const isActive = activeTab === tab;

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '0.4rem 0.85rem', // Balanced button size
                                    borderRadius: '20px',
                                    border: '1px solid',
                                    borderColor: isActive ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                                    backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                                    color: isActive ? '#000' : 'var(--color-text-secondary)',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem', // Small aesthetic font
                                    whiteSpace: 'nowrap',
                                    fontWeight: isActive ? '600' : '500',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                {Icon && <Icon size={14} color={isActive ? '#000' : iconColor} fill={isActive && tab === 'Most Active' ? '#000' : (tab === 'Most Active' ? iconColor : 'none')} />}
                                {tab}
                            </button>
                        );
                    })}
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
                            <StockRow key={stock.symbol} stock={stock} index={idx} activeTab={activeTab} logo={getLogo(stock.symbol)} />
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
