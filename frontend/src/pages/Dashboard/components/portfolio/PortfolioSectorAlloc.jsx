import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const PortfolioSectorAlloc = ({ data }) => {
    // 1. Process Data
    const sectorMap = data.reduce((acc, stock) => {
        const currentValue = stock.qty * stock.ltp;
        acc[stock.sector] = (acc[stock.sector] || 0) + currentValue;
        return acc;
    }, {});

    const totalValue = Object.values(sectorMap).reduce((sum, val) => sum + val, 0);

    const chartData = Object.keys(sectorMap)
        .map(sector => ({
            name: sector,
            value: sectorMap[sector],
            percent: (sectorMap[sector] / totalValue) * 100
        }))
        .sort((a, b) => b.value - a.value); // Sort desc for better visualization

    // Theme Colors (Gold, Green, Slate, etc.)
    const COLORS = ['#D1C79D', '#10b981', '#6b7280', '#c2410c', '#3b82f6', '#8b5cf6'];

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
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'white', marginBottom: '1rem' }}>
                Sector Exposure
            </h3>

            <div style={{ flex: 1, minHeight: '200px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                            itemStyle={{ color: '#e5e7eb' }}
                            formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text (Donut Hole) */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none'
                }}>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Sectors</div>
                </div>
            </div>

            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                Leading Sector: <span style={{ color: COLORS[0], fontWeight: 600 }}>{chartData[0]?.name || '--'}</span>
            </div>
        </div>
    );
};

export default PortfolioSectorAlloc;
