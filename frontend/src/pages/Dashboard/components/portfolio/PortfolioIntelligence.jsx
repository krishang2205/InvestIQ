import React, { useState } from 'react';
import { Sparkles, Info } from 'lucide-react';

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
                {/* Mini Sparkline Placeholder */}
                <div style={{ height: '0.25rem', width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', backgroundColor: level === 'high' ? '#f43f5e' : '#10b981', width: '60%' }}></div>
                </div>
            </div>
        </div>
    );
};

const PortfolioIntelligence = ({ intelligence }) => {
    const doctorSummary = intelligence?.doctor_summary;
    const alphaScore = intelligence?.alpha_score;
    const resilience = intelligence?.resilience_score;
    const netGain = intelligence?.net_gain_post_tax;

    const formatInr = (n) =>
        '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

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
                        {intelligence?.doctor_note ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <p style={{ fontSize: '0.875rem', color: '#d1d5db', lineHeight: '1.6', margin: 0 }}>
                                    {intelligence.doctor_note.diagnosis}
                                </p>
                                <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    {/* Structural Flags */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', marginBottom: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                                            Detected Signals
                                        </div>
                                        {intelligence.doctor_note.symptoms?.length > 0 ? (
                                            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#f59e0b', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                                {intelligence.doctor_note.symptoms.map((s, i) => <li key={i}><span style={{ color: '#e5e7eb' }}>{s}</span></li>)}
                                            </ul>
                                        ) : (
                                            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>No abnormal signals detected.</div>
                                        )}
                                    </div>
                                    {/* Actionable Insights */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', marginBottom: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34d399' }}></div>
                                            AI Focus Areas
                                        </div>
                                        {intelligence.doctor_note.prescriptions?.length > 0 ? (
                                            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#34d399', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                                {intelligence.doctor_note.prescriptions.map((p, i) => <li key={i}><span style={{ color: '#e5e7eb' }}>{p}</span></li>)}
                                            </ul>
                                        ) : (
                                            <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Structure is optimal.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p style={{ fontSize: '0.875rem', color: '#d1d5db', lineHeight: '1.625', margin: 0 }}>
                                {doctorSummary || 'AI insights will appear once your portfolio has enough history and holdings.'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Advanced Metrics Grid */}
            <div style={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
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
                    subtext="Estimated friction included"
                    level="medium"
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
        </div>
    );
};

export default PortfolioIntelligence;
