import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ArrowUpRight, Activity } from 'lucide-react';

const PortfolioHero = ({ summary, holdings, intelligence }) => {
    const totalValue = summary?.total_value ?? 0;
    const pnl = summary?.pnl ?? 0;
    const pnlPercent = summary?.pnl_percent ?? 0;

    // Backend provides `resilience_score` (0-100). Higher resilience => lower risk.
    const resilienceScore = intelligence?.resilience_score;
    const riskScore =
        resilienceScore != null && !Number.isNaN(Number(resilienceScore))
            ? Math.max(0, Math.min(100, Math.round(100 - Number(resilienceScore))))
            : null;
    const riskLevel = riskScore == null ? null : riskScore <= 40 ? 'low' : riskScore <= 70 ? 'medium' : 'high';
    const riskColors = {
        low: { border: '#10b981', text: '#34d399', bg: 'rgba(16, 185, 129, 0.1)' },
        medium: { border: '#fbbf24', text: '#fbbf24', bg: 'rgba(245, 158, 11, 0.1)' },
        high: { border: '#f87171', text: '#f87171', bg: 'rgba(248, 113, 113, 0.1)' },
    };
    const riskColor = riskLevel
        ? riskColors[riskLevel]
        : { border: '#6b7280', text: '#9ca3af', bg: 'rgba(107, 114, 128, 0.1)' };

    // Pie Chart Data: Current Market Value per Stock
    const COLORS = ['#D1C79D', '#A49B72', '#E5DEBA', '#8E865E', '#C0B589', '#F2EAD0', '#7A7250', '#DED4A9'];
    
    const chartData = (() => {
        const arr = Array.isArray(holdings) ? holdings : [];
        if (arr.length === 0) return [];
        
        const total = arr.reduce((sum, h) => sum + (Number(h.current_value) || 0), 0) || 1;
        
        return arr.map((h, idx) => ({
            name: h.ticker,
            value: Number(h.current_value) || 0,
            percentage: (((Number(h.current_value) || 0) / total) * 100).toFixed(1),
            color: COLORS[idx % COLORS.length]
        })).sort((a, b) => b.value - a.value);
    })();

    const hasChartData = chartData.length > 0;

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', position: 'relative', zIndex: 10 }}>
                    <div>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>Portfolio Allocation</h2>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: '#D1C79D' }}></span>
                            Current Market Value Breakdown
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                <div style={{ flex: 1, width: '100%', minHeight: 0, position: 'relative' }}>
                    {hasChartData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="40%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1E1E1E', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value, name, props) => [
                                        `₹${value.toLocaleString('en-IN')} (${props.payload.percentage}%)`,
                                        name
                                    ]}
                                />
                                <Legend
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align="right"
                                    iconType="circle"
                                    wrapperStyle={{ 
                                        paddingLeft: '20px',
                                        fontSize: '12px', 
                                        color: '#9ca3af' 
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280', fontSize: '0.875rem' }}>
                            No holdings yet. Add investments to see your allocation.
                        </div>
                    )}
                </div>
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
                        <h3 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'white', letterSpacing: '-0.025em', margin: '0 0 1rem 0' }}>
                            ₹{Number(totalValue).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </h3>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily P/L</span>
                                <span style={{ fontSize: '1.125rem', fontWeight: 600, color: pnl >= 0 ? '#34d399' : '#f43f5e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <ArrowUpRight size={18} />
                                    {pnl >= 0 ? '+' : ''}₹{Number(pnl).toLocaleString('en-IN', { maximumFractionDigits: 2 })} ({Number(pnlPercent).toFixed(2)}%)
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
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)',
                    borderLeft: `4px solid ${riskColor.border}`
                }}>
                    <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-secondary)', marginBottom: '0.25rem' }}>Composite Risk Score</p>
                        <h4 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', margin: 0 }}>
                            {riskScore != null ? `${riskScore}/100` : '--/100'}
                            <span style={{ fontSize: '0.875rem', fontWeight: 400, color: riskScore != null ? riskColor.text : '#6b7280', marginLeft: '0.5rem' }}>
                                {riskLevel === 'low' ? '(Low Risk)' : riskLevel === 'medium' ? '(Medium Risk)' : riskLevel === 'high' ? '(High Risk)' : ''}
                            </span>
                        </h4>
                    </div>
                    <div style={{ height: '3rem', width: '3rem', borderRadius: '50%', backgroundColor: riskColor.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid rgba(255,255,255,0.1)` }}>
                        <Activity size={24} color={riskColor.border} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortfolioHero;
