import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#D1C79D', '#10b981', '#6b7280', '#c2410c', '#3b82f6', '#8b5cf6', '#f59e0b', '#1f2937'];

const PortfolioAllocation = ({ holdings, intelligence }) => {
    const rebalancing = intelligence?.rebalancing || [];
    const data = (() => {
        const arr = Array.isArray(holdings) ? holdings : [];
        const sectorMap = arr.reduce((acc, s) => {
            const sector = s.sector || 'Unknown';
            const val = Number(s.current_value ?? (s.qty * s.ltp) ?? 0);
            acc[sector] = (acc[sector] || 0) + val;
            return acc;
        }, {});
        const total = Object.values(sectorMap).reduce((sum, v) => sum + v, 0) || 1;
        return Object.keys(sectorMap)
            .map((k, idx) => ({
                name: k,
                value: Math.round(((sectorMap[k] / total) * 100) * 10) / 10,
                color: COLORS[idx % COLORS.length],
            }))
            .sort((a, b) => b.value - a.value);
    })();

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
            {/* Donut Chart Card (Asset Allocation) */}
            <div className="glass-panel" style={{
                gridColumn: 'span 7',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', margin: 0 }}>Asset Allocation</h3>
                        <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.25rem' }}>Breakdown by Sector</p>
                    </div>
                    <button style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#a78bfa', cursor: 'pointer', transition: 'color 0.2s' }}>Manage Categories</button>
                </div>

                <div style={{ flex: 1, width: '100%', minHeight: '300px', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1E1E1E', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value) => [`${value}%`, 'Allocation']}
                            />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                iconType="circle"
                                wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text Overlay */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', paddingRight: '6rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ display: 'block', fontSize: '1.875rem', fontWeight: 700, color: 'white' }}>{data.length}</span>
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sectors</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Structural Risk Alerts */}
            <div className="glass-panel" style={{
                gridColumn: 'span 5',
                padding: '1.5rem',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '12px'
            }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', margin: 0 }}>Structure X-Ray</h3>
                        <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.25rem' }}>AI Portfolio Risk Alerts</p>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {rebalancing.length === 0 ? (
                        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                            Zero structural vulnerabilities detected.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {rebalancing.map((rec, idx) => (
                                <div key={idx} style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', borderLeft: `3px solid ${rec.type.includes('OVERWEIGHT') ? '#f59e0b' : '#3b82f6'}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white' }}>{rec.ticker}</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.125rem 0.375rem', borderRadius: '4px', backgroundColor: rec.type.includes('OVERWEIGHT') ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)', color: rec.type.includes('OVERWEIGHT') ? '#fcd34d' : '#93c5fd' }}>{rec.type}</span>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>{rec.reason}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#d1d5db', fontStyle: 'italic' }}>{rec.impact}</span>
                                        {rec.amount > 0 && <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#D1C79D' }}>Risk: ₹{Number(rec.amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PortfolioAllocation;
