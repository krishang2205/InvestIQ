import React from 'react';
import { Sparkles } from 'lucide-react';

const RiskMetricCard = ({ title, value, subtext, level }) => {
    // Level: low (green), medium (yellow), high (red)
    const colors = {
        low: { text: '#34d399', border: 'rgba(16, 185, 129, 0.2)', bg: 'rgba(16, 185, 129, 0.05)' },
        medium: { text: '#fbbf24', border: 'rgba(245, 158, 11, 0.2)', bg: 'rgba(245, 158, 11, 0.05)' },
        high: { text: '#f87171', border: 'rgba(243, 24, 65, 0.2)', bg: 'rgba(243, 24, 65, 0.05)' },
    };

    const style = colors[level] || colors.medium;

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
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{title}</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{value}</span>
                    <span style={{ fontSize: '0.75rem', color: level === 'high' ? '#f87171' : '#9ca3af' }}>{subtext}</span>
                </div>
            </div>

            <div style={{ marginTop: '0.75rem' }}>
                {/* Mini Sparkline Placeholder */}
                <div style={{ height: '0.25rem', width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', backgroundColor: level === 'high' ? '#f43f5e' : '#10b981', width: '60%' }}></div>
                </div>
            </div>
        </div>
    );
};

const PortfolioIntelligence = () => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
            {/* AI Insight Box (Full Width) */}
            <div className="glass-panel" style={{
                gridColumn: 'span 12',
                padding: '0.25rem',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(209, 199, 157, 0.1), transparent)', pointerEvents: 'none' }} />

                <div style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', position: 'relative', zIndex: 10 }}>
                    <div style={{
                        padding: '0.75rem',
                        borderRadius: '0.75rem',
                        background: 'linear-gradient(to bottom right, rgba(209, 199, 157, 0.2), rgba(176, 166, 120, 0.2))',
                        border: '1px solid rgba(209, 199, 157, 0.1)',
                        boxShadow: '0 0 15px rgba(209, 199, 157, 0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Sparkles color="#D1C79D" size={24} />
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                AI Portfolio Analysis
                                <span style={{ fontSize: '0.625rem', backgroundColor: 'rgba(209, 199, 157, 0.15)', color: '#D1C79D', padding: '0.125rem 0.5rem', borderRadius: '9999px', border: '1px solid rgba(209, 199, 157, 0.2)' }}>BETA</span>
                            </h3>
                            <button style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#D1C79D', cursor: 'pointer', transition: 'color 0.2s' }}>View detailed report →</button>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#d1d5db', lineHeight: '1.625' }}>
                            Your portfolio is heavily weighted towards <span style={{ color: '#D1C79D', fontWeight: 500 }}>Technology (45%)</span>, which increases volatility.
                            Consider diversifying into <span style={{ color: '#34d399', cursor: 'pointer', textDecoration: 'underline' }}>Government Bonds</span> or <span style={{ color: '#34d399', cursor: 'pointer', textDecoration: 'underline' }}>Consumer Staples</span> to balance risk.
                            The recent drop in tech stocks has increased your drawdown risk by <span style={{ color: '#f87171' }}>2.4%</span>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Risk Metrics Grid */}
            <div style={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <RiskMetricCard
                    title="Max Drawdown"
                    value="-12.4%"
                    subtext="vs -15% benchmark"
                    level="low"
                />
                <RiskMetricCard
                    title="Volatility (Beta)"
                    value="1.24"
                    subtext="High sensitivity"
                    level="high"
                />
                <RiskMetricCard
                    title="Sharpe Ratio"
                    value="1.85"
                    subtext="Good returns/risk"
                    level="medium"
                />
                <RiskMetricCard
                    title="Concentration"
                    value="Top 3: 45%"
                    subtext="High Alert"
                    level="high"
                />
            </div>
        </div>
    );
};

export default PortfolioIntelligence;
