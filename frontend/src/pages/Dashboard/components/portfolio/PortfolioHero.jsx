import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, Activity } from 'lucide-react';

const data = [
    { name: 'Jan', value: 12400000 },
    { name: 'Feb', value: 12800000 },
    { name: 'Mar', value: 13500000 },
    { name: 'Apr', value: 13200000 },
    { name: 'May', value: 14000000 },
    { name: 'Jun', value: 14800000 },
    { name: 'Jul', value: 15500000 },
];

const PortfolioHero = () => {
    const [timeRange, setTimeRange] = useState('1Y');

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', height: 'auto', minHeight: '340px' }}>
            {/* Left Card: Performance Graph (60%) */}
            <div className="glass-panel" style={{
                gridColumn: 'span 8',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', position: 'relative', zIndex: 10 }}>
                    <div>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>Portfolio Performance</h2>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#D1C79D' }}></span>
                            Net Asset Value
                        </div>
                    </div>
                    <div style={{ display: 'flex', backgroundColor: '#1E1E1E', borderRadius: '0.5rem', padding: '0.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {['1M', '3M', '1Y', 'ALL'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                style={{
                                    padding: '0.25rem 0.75rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    borderRadius: '0.375rem',
                                    transition: 'all 0.2s',
                                    border: 'none',
                                    cursor: 'pointer',
                                    backgroundColor: timeRange === range ? 'rgba(209, 199, 157, 0.15)' : 'transparent',
                                    color: timeRange === range ? '#D1C79D' : '#6b7280',
                                    boxShadow: timeRange === range ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                                }}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#D1C79D" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#D1C79D" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                tickFormatter={(value) => `₹${(value / 10000000).toFixed(1)}Cr`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1E1E1E', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Value']}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#D1C79D"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Right Card: The Pulse (40%) */}
            <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Total Value & P/L */}
                <div className="glass-panel" style={{
                    padding: '1.5rem',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)'
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '1.25rem', opacity: 0.1 }}>
                        <Activity size={120} color="#D1C79D" />
                    </div>

                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-secondary)', marginBottom: '0.25rem' }}>Total Portfolio Value</p>
                        <h3 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'white', letterSpacing: '-0.025em', margin: '0 0 1rem 0' }}>₹1,55,42,050.00</h3>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily P/L</span>
                                <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <ArrowUpRight size={18} /> +₹1,24,050.00 (0.8%)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Risk Score Badge */}
                <div className="glass-panel" style={{
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderLeft: '4px solid #10b981',
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)',
                    borderLeftWidth: '4px',
                    borderLeftColor: '#10b981'
                }}>
                    <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-secondary)', marginBottom: '0.25rem' }}>Composite Risk Score</p>
                        <h4 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', margin: 0 }}>42/100 <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#34d399', marginLeft: '0.5rem' }}>(Low Risk)</span></h4>
                    </div>
                    <div style={{ height: '3rem', width: '3rem', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <Activity size={24} color="#10b981" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortfolioHero;
