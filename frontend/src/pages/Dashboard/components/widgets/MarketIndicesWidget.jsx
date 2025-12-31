import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

const IndexCard = ({ name, value, change, data }) => {
    const isPositive = change >= 0;
    const color = isPositive ? '#00C853' : '#FF4D4D';

    return (
        <div className="shadow-soft-lift" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minWidth: '0',
            cursor: 'pointer',
            border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
            <div style={{ marginBottom: '0.5rem' }}>
                <div style={{
                    fontSize: '0.9rem',
                    color: 'var(--color-text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: '500' // Medium weight like Tickertape
                }}>
                    {name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
                        {value.toLocaleString()}
                    </div>
                    <div style={{
                        color: color,
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        backgroundColor: isPositive ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 77, 77, 0.1)',
                        padding: '2px 6px',
                        borderRadius: '6px'
                    }}>
                        {isPositive ? '+' : ''}{change}%
                    </div>
                </div>
            </div>

            <div style={{ height: '60px', marginTop: '0.5rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`gradient-${name.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            fill={`url(#gradient-${name.replace(/\s+/g, '')})`}
                            strokeWidth={2}
                            isAnimationActive={true}
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const MarketIndicesWidget = () => {
    // Generate simple mock data for sparkline (random walk)
    const generateMockData = (startValue) => {
        let current = startValue;
        return Array.from({ length: 40 }, () => {
            current = current * (1 + (Math.random() - 0.5) * 0.03);
            return { value: current };
        });
    };

    const indices = [
        { name: 'NIFTY 50', value: 21741.90, change: 0.54, data: generateMockData(21600) },
        { name: 'SENSEX', value: 72038.43, change: 0.49, data: generateMockData(71800) },
        { name: 'BANK NIFTY', value: 48292.25, change: -0.15, data: generateMockData(48400) },
        { name: 'NIFTY IT', value: 35691.30, change: 1.12, data: generateMockData(35200) },
    ];

    return (
        <div className="glass-panel shadow-soft-lift" style={{
            padding: '1.5rem',
            borderRadius: '16px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>Market Information</h3>
                <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.05)'
                }}>
                    View all
                </div>
            </div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1.25rem', // Wider gap
                flex: 1
            }}>
                {indices.map(idx => (
                    <IndexCard key={idx.name} {...idx} />
                ))}
            </div>
        </div>
    );
};

export default MarketIndicesWidget;
