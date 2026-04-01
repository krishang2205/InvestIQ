import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Info, Sparkles, BarChart2 } from 'lucide-react';

const COLORS = ['#D1C79D', '#10b981', '#6b7280', '#c2410c', '#3b82f6', '#8b5cf6', '#f59e0b', '#1f2937'];

const TooltipIcon = ({ text }) => {
    const [show, setShow] = useState(false);
    return (
        <div 
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: '0.4rem', cursor: 'help' }}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            <Info size={12} color="#9ca3af" />
            {show && (
                <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'rgba(30, 30, 30, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    color: '#e5e7eb',
                    fontSize: '0.75rem',
                    borderRadius: '0.5rem',
                    width: 'max-content',
                    maxWidth: '180px',
                    zIndex: 50,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                    textTransform: 'none',
                    letterSpacing: 'normal',
                    lineHeight: '1.4',
                    whiteSpace: 'normal'
                }}>
                    {text}
                </div>
            )}
        </div>
    );
};

const RiskMetricCard = ({ title, value, subtext, level, tooltip }) => {
    return (
        <div className="glass-panel" style={{
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: `1px solid ${level === 'high' ? 'rgba(243, 24, 65, 0.3)' : 'rgba(255,255,255,0.05)'}`,
            transition: 'all 0.3s',
            borderRadius: '12px',
            backgroundColor: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.backgroundColor = 'var(--glass-bg)';
            }}
        >
            <div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', display: 'flex', alignItems: 'center' }}>
                    {title}
                    {tooltip && <TooltipIcon text={tooltip} />}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{value}</span>
                    <span style={{ fontSize: '0.75rem', color: level === 'high' ? '#f87171' : '#9ca3af' }}>{subtext}</span>
                </div>
            </div>

            <div style={{ marginTop: '0.75rem' }}>
                <div style={{ height: '0.25rem', width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', backgroundColor: level === 'high' ? '#f43f5e' : '#10b981', width: '60%' }}></div>
                </div>
            </div>
        </div>
    );
};

const PortfolioAllocation = ({ holdings, intelligence }) => {
    const rebalancing = intelligence?.rebalancing || [];
    const alphaScore = intelligence?.alpha_score;
    const resilience = intelligence?.resilience_score;
    const netGain = intelligence?.net_gain_post_tax;

    const formatInr = (n) => {
        const val = Number(n || 0);
        const formatted = Math.abs(val).toLocaleString('en-IN', { maximumFractionDigits: 0 });
        return val < 0 ? `-₹${formatted}` : `₹${formatted}`;
    };

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
            
            {/* Health Matrix Grid - Shifted to Portfolio Allocation Section */}
            <div style={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '0.5rem' }}>
                <RiskMetricCard
                    title="Resilience Score"
                    value={resilience != null ? `${resilience}/100` : '--'}
                    subtext="Stress-test proxy"
                    level={resilience != null && resilience >= 70 ? 'low' : resilience != null && resilience >= 45 ? 'medium' : 'high'}
                    tooltip="Measures how well your portfolio can survive a major market crash based on past historic crises (0-100 scale)."
                />
                <RiskMetricCard
                    title="Alpha Score"
                    value={alphaScore != null ? `${alphaScore}` : '--'}
                    subtext="Uniqueness vs benchmark"
                    level={alphaScore != null && alphaScore >= 60 ? 'low' : alphaScore != null && alphaScore >= 30 ? 'medium' : 'high'}
                    tooltip="Shows how unique your portfolio is compared to the Nifty 50. A high score means you're acting independently, not just copying the index."
                />
                <RiskMetricCard
                    title="Net Gain (Post Tax)"
                    value={netGain != null ? formatInr(netGain) : '--'}
                    subtext="Est. Profit After Tax"
                    level={netGain != null && netGain >= 0 ? 'low' : 'high'}
                    tooltip="Your total estimated profit AFTER paying Indian capital gains tax (STCG/LTCG) and average broker fees."
                />
                <RiskMetricCard
                    title="Valuation Radar"
                    value={intelligence?.fundamentals?.avg_pe ? `${intelligence.fundamentals.avg_pe}x` : '--'}
                    subtext={intelligence?.fundamentals?.pe_label || 'Avg P/E Ratio'}
                    level={intelligence?.fundamentals?.pe_label === 'Premium' ? 'high' : intelligence?.fundamentals?.pe_label === 'Undervalued' ? 'low' : 'medium'}
                    tooltip="The average Price-to-Earnings (P/E) ratio of your stocks. A high number means your collection of stocks is currently expensive."
                />
                <RiskMetricCard
                    title="Portfolio Volatility"
                    value={intelligence?.fundamentals?.beta ? `${intelligence.fundamentals.beta}β` : '--'}
                    subtext={intelligence?.fundamentals?.beta_label || 'Beta vs Index'}
                    level={intelligence?.fundamentals?.beta_label === 'Aggressive' ? 'high' : intelligence?.fundamentals?.beta_label === 'Defensive' ? 'low' : 'medium'}
                    tooltip="A measure of risk (Beta). If it is above 1.0, your portfolio swings more wildly and is more risky than the overall stock market."
                />
                <RiskMetricCard
                    title="Dividend Cashflow"
                    value={intelligence?.fundamentals?.dividend_cashflow ? formatInr(intelligence.fundamentals.dividend_cashflow) : '--'}
                    subtext={`Est. Annual (${intelligence?.fundamentals?.dividend_yield || 0}%)`}
                    level="low"
                    tooltip="The estimated total cash you will receive in your bank account over a year from company dividend payouts, based on current yields."
                />
            </div>

            {/* Donut Chart Card (Renamed to Portfolio Allocation) */}
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
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', margin: 0 }}>Portfolio Allocation</h3>
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
