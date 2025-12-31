import React, { useState, useRef, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { MoreHorizontal } from 'lucide-react';
import IndexDetailCard from './IndexDetailCard';

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

    const indices = [
        { id: 'nifty50', name: 'NIFTY 50', price: 21731.40, change: 0.85, symbol: 'NIFTY 50', constituents: 50 },
        { id: 'sensex', name: 'SENSEX', price: 72038.43, change: 0.78, symbol: 'SENSEX', constituents: 30 },
        { id: 'banknifty', name: 'BANK NIFTY', price: 46058.20, change: -0.21, symbol: 'BANK NIFTY', constituents: 12 },
        { id: 'nifty100', name: 'NIFTY 100', price: 26689.30, change: 0.63, symbol: 'NIFTY 100', constituents: 100 },
        { id: 'midcap', name: 'NIFTY MIDCAP', price: 47820.10, change: 1.25, symbol: 'NIFTY MIDCAP 100', constituents: 100 },
        { id: 'smallcap', name: 'NIFTY SMALL', price: 15400.50, change: 2.10, symbol: 'NIFTY SMALLCAP 100', constituents: 100 },
    ];

    // Close card on outside click (handled mostly by IndexDetailCard now, but keep for safety)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target) && !document.getElementById('portal-root')?.contains(event.target)) {
                // Logic moved to card for portal, but clearing state here is fine if needed
            }
        };
        // document.addEventListener('mousedown', handleClickOutside);
        // return () => document.removeEventListener('mousedown', handleClickOutside);
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

    return (
        <div
            ref={containerRef}
            className="glass-panel shadow-soft-lift"
            style={{
                padding: '1.25rem', // Reduced padding
                borderRadius: '16px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>Indian Indices</h3>
                <MoreHorizontal size={18} color="var(--color-text-secondary)" style={{ cursor: 'pointer' }} />
            </div>

            <div className="custom-scrollbar" style={{
                flex: 1,
                overflowY: 'auto',
                paddingRight: '0.25rem', // Reduced scroll padding
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', // Smaller min width
                gap: '0.75rem', // Tighter gap
                alignContent: 'start'
            }}>
                {indices.map((index, i) => (
                    <div
                        key={index.id}
                        onClick={(e) => handleIndexClick(e, index.id)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: '0.85rem', // Tighter card padding
                            borderRadius: '10px',
                            backgroundColor: activeIndex === index.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            border: activeIndex === index.id ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                            position: 'relative'
                        }}
                        className="index-card-hover"
                    >
                        {/* Detail Card Overlay - Only render if active */}
                        {activeIndex === index.id && (
                            <IndexDetailCard
                                indexData={index}
                                anchorEl={anchorEl}
                                onClose={() => {
                                    setActiveIndex(null);
                                    setAnchorEl(null);
                                }}
                            />
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{index.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{index.price.toLocaleString()}</span>
                            </div>
                            <span style={{
                                fontSize: '0.75rem',
                                color: index.change >= 0 ? '#00C853' : '#FF4D4D',
                                fontWeight: '500'
                            }}>
                                {index.change >= 0 ? '+' : ''}{index.change}%
                            </span>
                        </div>

                        <div style={{ height: '35px', width: '100%', marginTop: 'auto' }}>
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
