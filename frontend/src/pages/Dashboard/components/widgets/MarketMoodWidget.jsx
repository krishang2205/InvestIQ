import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const MarketMoodWidget = () => {
    // Mock data for the gauge (Value 72/100)
    const score = 72;
    const data = [
        { name: 'Score', value: score },
        { name: 'Remaining', value: 100 - score },
    ];

    // Colors: Low (Red), Mid (Yellow), High (Green)
    // For now simplistic, later we can make it dynamic based on score
    const getColor = (val) => {
        if (val < 30) return '#FF4D4D'; // Extreme Fear
        if (val < 50) return '#FFCA28'; // Fear
        if (val < 70) return '#66BB6A'; // Greed
        return '#00C853'; // Extreme Greed
    };

    const activeColor = getColor(score);
    const COLORS = [activeColor, '#e0e0e0']; // Active part, inactive part

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                    Market Mood Index
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>See details &gt;</span>
            </div>

            <div style={{ width: '100%', height: '180px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={80}
                            outerRadius={100}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div style={{
                    position: 'absolute',
                    bottom: '0',
                    width: '100%',
                    textAlign: 'center',
                    marginBottom: '10px'
                }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: activeColor, lineHeight: '1' }}>{score}</div>
                    <div style={{ color: activeColor, fontWeight: '600', fontSize: '1rem' }}>Extreme Greed</div>
                </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '1rem' }}>
                Markets are overbought. Exercise caution.
            </p>
        </div>
    );
};

export default MarketMoodWidget;
