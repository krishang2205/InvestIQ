import React from 'react';

const PortfolioMarketCap = ({ data }) => {
    // 1. Process Data
    const capMap = data.reduce((acc, stock) => {
        const currentValue = stock.qty * stock.ltp;
        acc[stock.marketCap] = (acc[stock.marketCap] || 0) + currentValue;
        return acc;
    }, { 'Large': 0, 'Mid': 0, 'Small': 0 });

    const totalValue = Object.values(capMap).reduce((sum, val) => sum + val, 0);

    const chartData = [
        { name: 'Large Cap', value: capMap['Large'], color: '#3b82f6', percent: (capMap['Large'] / totalValue) * 100 },
        { name: 'Mid Cap', value: capMap['Mid'], color: '#10b981', percent: (capMap['Mid'] / totalValue) * 100 },
        { name: 'Small Cap', value: capMap['Small'], color: '#f59e0b', percent: (capMap['Small'] / totalValue) * 100 },
    ];

    // 2. Generate Insight
    const dominant = chartData.reduce((prev, current) => (prev.percent > current.percent) ? prev : current);
    let insightText = "";
    if (dominant.name === 'Large Cap') insightText = "Your portfolio is biased towards stability.";
    if (dominant.name === 'Mid Cap') insightText = "Balanced approach with growth potential.";
    if (dominant.name === 'Small Cap') insightText = "High-growth aggression detected.";

    return (
        <div className="glass-panel animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200" style={{
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
                {chartData.map((cap) => (
                    <div key={cap.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                            <span style={{ color: '#e5e7eb' }}>{cap.name}</span>
                            <span style={{ color: '#9ca3af' }}>{cap.percent.toFixed(1)}%</span>
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
                                width: `${cap.percent}%`,
                                background: cap.color,
                                borderRadius: '4px',
                                transition: 'width 0.5s ease-out'
                            }} />
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center' }}>
                    <span style={{ color: dominant.color }}>Ai Insight:</span> {insightText}
                </p>
            </div>
        </div>
    );
};

export default PortfolioMarketCap;
