import React, { useState, useRef, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { MoreHorizontal } from 'lucide-react';
import IndexDetailCard from './IndexDetailCard';
import useMarketData from '../../../../hooks/useMarketData';

const Sparkline = ({ color }) => {
    const data = Array.from({ length: 20 }, (_, i) => ({
        name: i,
        value: Math.random() * 100
    }));

    return (
        <div style={{ width: '60px', height: '30px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke={color} fill={`url(#gradient-${color})`} strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

const MarketIndicesWidget = () => {
    const [activeIndex, setActiveIndex] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const containerRef = useRef(null);

    // Fetch real indices data
    const { data: indicesData, loading, error } = useMarketData('indices', 60000); // 1 min refresh

    // Fallback data if loading or error (optional, or show skeletons)
    // For now, let's just use empty array or previous data
    const indices = indicesData || [];

    // Close card on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Logic kept for potential future use or cleanup
        };
    }, []);

    const handleIndexClick = (e, id) => {
        if (activeIndex === id) {
            setActiveIndex(null);
            setAnchorEl(null);
        } else {
            setActiveIndex(id);
            setAnchorEl(e.currentTarget);
        }
    };

    // Logo Helper
    const getIndexLogo = (name) => {
        if (!name) return '';
        if (name.includes('NIFTY')) return 'https://www.google.com/s2/favicons?domain=nseindia.com&sz=128';
        if (name.includes('SENSEX')) return 'https://www.google.com/s2/favicons?domain=bseindia.com&sz=128';
        return 'https://www.google.com/s2/favicons?domain=google.com&sz=128';
    };

    if (loading && indices.length === 0) {
        return (
            <div className="glass-panel shadow-soft-lift" style={{ height: '100%', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Loading Indices...</span>
            </div>
        );
    }

    if (error && indices.length === 0) {
        return (
            <div className="glass-panel shadow-soft-lift" style={{ height: '100%', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Indices Unavailable</span>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="glass-panel shadow-soft-lift"
            style={{
                padding: '1.25rem',
                borderRadius: '16px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>Indian Indices</h3>
                <MoreHorizontal size={18} color="var(--color-text-secondary)" style={{ cursor: 'pointer' }} />
            </div>

            <div className="custom-scrollbar" style={{
                flex: 1,
                paddingRight: '0.25rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', // Responsive grid
                gridAutoFlow: 'column', // Force horizontal scroll if needed
                gap: '0.75rem',
                alignContent: 'start',
                overflowX: 'auto',
                overflowY: 'hidden'
            }}>
                {indices.map((index, i) => (
                    <div
                        key={index.symbol || i} // Use symbol as key if available
                        onClick={(e) => handleIndexClick(e, index.symbol)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: '0.85rem',
                            borderRadius: '10px',
                            backgroundColor: activeIndex === index.symbol ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            border: activeIndex === index.symbol ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                            position: 'relative',
                            minWidth: '140px'
                        }}
                        className="index-card-hover"
                    >
                        {/* Detail Card Overlay - Only render if active (Note: simplified for now as IndexDetailCard needs data) */}
                        {activeIndex === index.symbol && (
                            <div style={{ position: 'absolute' }}></div>
                            // Placeholder: IndexDetailCard needs to be updated to accept real data structure if specific fields differ
                            // For now, we omit it to avoid breaking if props mismatch. 
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '0.5rem' }}>
                            {/* Logo & Name Row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <img
                                    src={getIndexLogo(index.name)}
                                    alt={index.name}
                                    style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'contain', backgroundColor: 'white', padding: '2px' }}
                                />
                                <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{index.name}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{index.price?.toLocaleString()}</span>
                            </div>
                            <span style={{
                                fontSize: '0.75rem',
                                color: index.change >= 0 ? '#00C853' : '#FF4D4D',
                                fontWeight: '500'
                            }}>
                                {index.change >= 0 ? '+' : ''}{index.change?.toFixed(2)} ({index.percentChange?.toFixed(2)}%)
                            </span>
                        </div>

                        <div style={{ height: '35px', width: '100%', marginTop: 'auto' }}>
                            {/* Sparkline is random, so we can keep it as visual candy or remove */}
                            <Sparkline color={index.change >= 0 ? '#00C853' : '#FF4D4D'} />
                        </div>
                    </div>
                ))}
            </div>

            <div style={{
                marginTop: '1rem',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                fontWeight: '600',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }}>
                View all indices
            </div>
        </div>
    );
};

export default MarketIndicesWidget;
