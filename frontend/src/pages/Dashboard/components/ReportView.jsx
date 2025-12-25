import React, { useState } from 'react';
import { ArrowLeft, Download, Share2, Info, AlertTriangle, ChevronRight, BarChart2 } from 'lucide-react';

const ReportView = ({ data, onBack }) => {
    // Helper for Status Pills
    const StatusPill = ({ label, value, type }) => {
        const colors = {
            positive: 'rgba(16, 185, 129, 0.2)', // Green
            neutral: 'rgba(234, 179, 8, 0.2)',   // Yellow
            negative: 'rgba(239, 68, 68, 0.2)'    // Red
        };
        const textColors = {
            positive: '#34d399',
            neutral: '#facc15',
            negative: '#f87171'
        };

        return (
            <div style={{
                background: colors[type] || colors.neutral,
                padding: '0.5rem 1rem',
                borderRadius: '99px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '100px'
            }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', textTransform: 'uppercase' }}>{label}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: textColors[type] || textColors.neutral }}>{value}</span>
            </div>
        );
    };

    // Helper for SVG Line Chart (Price)
    const PriceHeight = 200;
    const PriceWidth = 600;
    const maxPrice = Math.max(...data.priceBehavior.chartData.map(d => d.price)) * 1.1;
    const minPrice = Math.min(...data.priceBehavior.chartData.map(d => d.price)) * 0.9;
    const points = data.priceBehavior.chartData.map((d, i) => {
        const x = (i / (data.priceBehavior.chartData.length - 1)) * PriceWidth;
        const y = PriceHeight - ((d.price - minPrice) / (maxPrice - minPrice)) * PriceHeight;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '6rem' }}>

            {/* 1. TOP HEADER (Fixed/Sticky behavior simulated by margin) */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1rem 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{data.header.company}</h1>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-secondary)', marginTop: '0.25rem' }}>
                            <span>{data.header.symbol}</span> •
                            <span style={{ padding: '0 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>{data.header.exchange}</span> •
                            <span style={{ padding: '0 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>{data.header.sector}</span>
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{data.header.generatedOn}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>Range: {data.header.dataRange}</p>
                    <span style={{ fontSize: '0.65rem', background: '#333', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#aaa' }}>INFORMATIONAL REPORT</span>
                </div>
            </div>

            {/* 2. SNAPSHOT CARD */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
                    <div>
                        <p style={{ color: 'var(--color-text)', lineHeight: '1.6', marginBottom: '1rem' }}>{data.snapshot.description}</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {data.snapshot.domains.map(d => (
                                <span key={d} style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', border: '1px solid var(--color-secondary)', borderRadius: '1rem', color: 'var(--color-secondary)' }}>
                                    {d}
                                </span>
                            ))}
                        </div>
                    </div>
                    {/* Key Metrics Grid */}
                    {data.snapshot.keyMetrics && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                            {data.snapshot.keyMetrics.map(m => (
                                <div key={m.label}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', display: 'block' }}>{m.label}</span>
                                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary)' }}>{m.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 3. EXECUTIVE SUMMARY */}
            <div style={{ background: 'linear-gradient(180deg, rgba(209, 199, 157, 0.1) 0%, rgba(0,0,0,0) 100%)', padding: '2rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid var(--color-accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                    {data.executiveSummary.status.map(s => <StatusPill key={s.label} {...s} />)}
                </div>
                <p style={{ textAlign: 'center', fontSize: '1.1rem', lineHeight: '1.6', fontWeight: 500 }}>
                    {data.executiveSummary.text}
                </p>
            </div>

            {/* 4. PRICE BEHAVIOR */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderLeft: '4px solid var(--color-accent)', paddingLeft: '0.75rem' }}>Price Behavior</h3>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    {/* Simple SVG Line Chart */}
                    <div style={{ height: '200px', width: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                        <svg viewBox={`0 0 ${PriceWidth} ${PriceHeight}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                            <polyline fill="none" stroke="var(--color-accent)" strokeWidth="3" points={points} />
                            {/* Gradient Area */}
                            <defs>
                                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <polyline fill="url(#chartGradient)" stroke="none" points={`${points} ${PriceWidth},${PriceHeight} 0,${PriceHeight}`} />
                        </svg>
                        {/* Axis labels mocked */}
                        <div style={{ position: 'absolute', bottom: '-20px', left: 0, fontSize: '0.75rem', color: 'var(--color-secondary)' }}>Oct 24</div>
                        <div style={{ position: 'absolute', bottom: '-20px', right: 0, fontSize: '0.75rem', color: 'var(--color-secondary)' }}>Oct 25</div>
                    </div>
                    <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-secondary)', lineHeight: 1.6 }}>{data.priceBehavior.interpretation}</p>
                </div>
            </div>

            {/* 5. VOLATILITY STRIP */}
            <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ width: '100px', fontSize: '0.875rem', fontWeight: 600 }}>Volatility</span>
                <div style={{ flex: 1, height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${data.volatility.value}%`, height: '100%', background: 'linear-gradient(90deg, #34d399 0%, #facc15 100%)' }}></div>
                </div>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-secondary)' }}>{data.volatility.level}</span>
                <Info size={16} color="var(--color-secondary)" />
            </div>

            {/* 6. TECHNICAL SIGNALS */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderLeft: '4px solid var(--color-accent)', paddingLeft: '0.75rem' }}>Technical Signals</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {data.technicalSignals.map(sig => (
                        <div key={sig.name} className="glass-panel" style={{ padding: '1rem', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{sig.name}</span>
                                <span style={{ fontSize: '0.75rem', color: sig.status === 'Bullish' ? '#34d399' : '#facc15' }}>{sig.status}</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>{sig.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 7. SENTIMENT & 8. RISK (Side by Side) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderLeft: '4px solid var(--color-accent)', paddingLeft: '0.75rem' }}>Market Sentiment</h3>
                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.75rem' }}>Negative</span>
                            <div style={{ flex: 1, height: '4px', background: '#333' }}>
                                <div style={{ marginLeft: `${data.sentiment.score}%`, width: '8px', height: '8px', borderRadius: '50%', background: '#fff', marginTop: '-2px' }}></div>
                            </div>
                            <span style={{ fontSize: '0.75rem' }}>Positive</span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)' }}>{data.sentiment.text}</p>
                    </div>
                </div>
                <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderLeft: '4px solid var(--color-accent)', paddingLeft: '0.75rem' }}>Risk Factors</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {data.riskSignals.map((risk, i) => (
                            <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'start', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                                <AlertTriangle size={16} color="#f87171" style={{ marginTop: '2px' }} />
                                <span style={{ fontSize: '0.875rem', color: '#fca5a5' }}>{risk.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 9. EXPLAINABILITY */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderLeft: '4px solid var(--color-accent)', paddingLeft: '0.75rem' }}>Analytical Weighting</h3>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', height: '100px', gap: '1rem' }}>
                        {data.explainability.factors.map(f => (
                            <div key={f.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                <div style={{ width: '100%', height: `${f.value}%`, background: 'var(--color-primary)', borderRadius: '4px', opacity: 0.5 }}></div>
                                <span style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>{f.name}</span>
                            </div>
                        ))}
                    </div>
                    <p style={{ flex: 1, fontSize: '0.875rem', color: 'var(--color-secondary)', fontStyle: 'italic' }}>
                        {data.explainability.text}
                    </p>
                </div>
            </div>

            {/* 10. INDUSTRY & FINANCIAL DEEP DIVE (New Sections) */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderLeft: '4px solid var(--color-accent)', paddingLeft: '0.75rem' }}>{data.industryOverview.title}</h3>
                <p style={{ color: 'var(--color-text)', lineHeight: '1.7', marginBottom: '2rem', fontSize: '0.95rem' }}>
                    {data.industryOverview.text}
                </p>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderLeft: '4px solid var(--color-accent)', paddingLeft: '0.75rem' }}>{data.financialAnalysis.title}</h3>
                <p style={{ color: 'var(--color-text)', lineHeight: '1.7', fontSize: '0.95rem' }}>
                    {data.financialAnalysis.text}
                </p>
            </div>

            {/* 11. PEER COMPARISON (New Section) */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderLeft: '4px solid var(--color-accent)', paddingLeft: '0.75rem' }}>Peer Benchmarking</h3>
                <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Company</th>
                                <th style={{ padding: '1rem' }}>Price</th>
                                <th style={{ padding: '1rem' }}>P/E Ratio</th>
                                <th style={{ padding: '1rem' }}>ROE</th>
                                <th style={{ padding: '1rem' }}>Revenue (Q)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.peerComparison.map((peer, i) => (
                                <tr key={peer.name} style={{ borderBottom: i !== data.peerComparison.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>{peer.name}</td>
                                    <td style={{ padding: '1rem' }}>{peer.price}</td>
                                    <td style={{ padding: '1rem', color: peer.name === 'TCS' ? 'var(--color-primary)' : 'inherit' }}>{peer.pe}</td>
                                    <td style={{ padding: '1rem' }}>{peer.roe}</td>
                                    <td style={{ padding: '1rem' }}>{peer.revenue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 12. STRATEGIC OUTLOOK (New Section) */}
            <div style={{ marginBottom: '4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', color: '#60a5fa', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Tactical View (0-3 Months)</span>
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{data.outlook.shortTerm}</p>
                </div>
                <div style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', color: '#34d399', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Structural View (12+ Months)</span>
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{data.outlook.longTerm}</p>
                </div>
            </div>

            {/* 13. COMPLIANCE */}
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-secondary)', margin: '4rem 0' }}>
                <p>This report is for informational purposes only. InvestIQ does not provide investment advice.</p>
                <p>Regulatory Awareness: Data is based on historical patterns and AI analysis.</p>
            </div>

            {/* 11. ACTION BAR (Sticky Bottom) */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
                padding: '1rem 2rem', borderTop: '1px solid var(--glass-border)',
                display: 'flex', justifyContent: 'flex-end', gap: '1rem',
                zIndex: 100
            }}>
                <button style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--color-secondary)', color: 'var(--color-text)', borderRadius: '8px', cursor: 'pointer' }}>
                    Compare
                </button>
                <button style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--color-secondary)', color: 'var(--color-text)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Download size={16} /> PDF
                </button>
                <button style={{
                    padding: '0.5rem 1.5rem', background: 'var(--color-accent)', border: 'none',
                    color: 'var(--color-bg)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                    View Outlook <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default ReportView;
