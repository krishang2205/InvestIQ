import React from 'react';

const PortfolioMarketCap = ({ data }) => {
    // Basic Shell - Data processing in Commit 2
    const dummyData = [
        { name: 'Large Cap', value: 60, color: '#3b82f6' },
        { name: 'Mid Cap', value: 30, color: '#10b981' },
        { name: 'Small Cap', value: 10, color: '#f59e0b' },
    ];

    return (
        <div className="glass-panel" style={{
            padding: '1.5rem',
            borderRadius: '20px',
            background: 'rgba(30,30,30,0.4)',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'white', marginBottom: '1.5rem' }}>
                Market Cap Analysis
            </h3>

            {/* Caps Distribution Bars */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem' }}>
                {dummyData.map((cap) => (
                    <div key={cap.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                            <span style={{ color: '#e5e7eb' }}>{cap.name}</span>
                            <span style={{ color: '#9ca3af' }}>{cap.value}%</span>
                        </div>
                        <div style={{
                            height: '8px',
                            width: '100%',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%',
                                width: `${cap.value}%`,
                                background: cap.color,
                                borderRadius: '4px'
                            }} />
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'center' }}>
                    Awaiting Data Integration...
                </p>
            </div>
        </div>
    );
};

export default PortfolioMarketCap;
