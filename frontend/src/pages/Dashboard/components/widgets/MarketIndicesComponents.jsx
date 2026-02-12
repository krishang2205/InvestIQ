import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import IndexDetailCard from './IndexDetailCard';

export const Sparkline = ({ color }) => {
    // Generate deterministic data based on color hash or random for now
    const data = Array.from({ length: 20 }, (_, i) => ({
        name: i,
        value: Math.random() * 100
    }));

    return (
        <div style={{ width: '60px', height: '30px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke={color} fill={`url(#gradient-${color.replace('#', '')})`} strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export const IndexItem = ({ index, activeIndex, handleIndexClick, getIndexLogo, anchorEl, setActiveIndex, setAnchorEl }) => {
    return (
        <div
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
            {activeIndex === index.symbol && (
                <div style={{ position: 'absolute' }}></div>
                // Placeholder for potential overlay logic, mostly handled by parent or IndexDetailCard
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '0.5rem' }}>
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
                <Sparkline color={index.change >= 0 ? '#00C853' : '#FF4D4D'} />
            </div>
        </div>
    );
};
