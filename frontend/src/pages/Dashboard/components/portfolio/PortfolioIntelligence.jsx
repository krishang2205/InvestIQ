import React from 'react';
import { Sparkles, BarChart2, Lock, ArrowRight, ChevronRight, Activity, TrendingUp, Shield, AlertTriangle, Zap, ShieldCheck } from 'lucide-react';

const PortfolioIntelligence = ({ intelligence, onViewDetailed }) => {
    const doctorNote = intelligence?.doctor_note;
    const diagnosis = doctorNote?.diagnosis || intelligence?.doctor_summary || null;
    const perfSummary = doctorNote?.performance_summary || null;
    const reasons = doctorNote?.reasons || [];
    const symptoms = doctorNote?.symptoms || [];
    const prescriptions = doctorNote?.prescriptions || [];
    const rating = doctorNote?.doctor_rating || null;
    const meta = doctorNote?.meta || {};

    const isHealthy = rating === 'Clinically Diversified';
    const accent = '#D1C79D';
    const accentGlow = 'rgba(209,199,157,0.15)';

    const premiumFeatures = [
        { icon: AlertTriangle, label: 'Macro Risk Exposure', desc: 'Hidden sector concentration across exposure', tag: 'HIGH RISK', color: '#ef4444' },
        { icon: Zap, label: 'Behavioral Bias Audit', desc: 'Recency bias in last 90-day winners', tag: 'ALERT', color: '#f59e0b' },
        { icon: ShieldCheck, label: 'Valuation Thermometer', desc: 'P/E exceeds exit zone threshold', tag: 'EXIT ZONE', color: '#ef4444' },
    ];

    return (
        <div className="glass-panel" style={{
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid var(--glass-border)',
        }}>
            {/* ── Gold accent top line ── */}
            <div style={{
                height: '1px',
                background: `linear-gradient(90deg, transparent 0%, ${accent}66 50%, transparent 100%)`,
            }} />

            {/* ═══════ HEADER ═══════ */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--glass-border)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        background: accentGlow,
                        border: `1px solid ${accent}33`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Sparkles size={14} color={accent} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                                AI Portfolio Intelligence
                            </span>
                            <span style={{
                                fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.1em',
                                color: accent, background: `${accent}12`,
                                border: `1px solid ${accent}25`,
                                borderRadius: '4px', padding: '0.1rem 0.375rem',
                            }}>LIVE</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>
                            Structural diagnostic · {meta.positions || 0} positions analyzed
                        </span>
                    </div>
                </div>
                <button
                    onClick={onViewDetailed}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-secondary)',
                        padding: 0, transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = accent}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-secondary)'}
                >
                    Full report <ChevronRight size={13} />
                </button>
            </div>

            {/* ═══════ BODY ═══════ */}
            <div style={{ padding: '1.5rem' }}>

                {/* ── Status + Rating ── */}
                {rating && (
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.3rem 0.625rem', borderRadius: '6px', marginBottom: '1rem',
                        background: isHealthy ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                        border: `1px solid ${isHealthy ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                    }}>
                        {/* Pulsing dot */}
                        <div style={{ position: 'relative', width: '6px', height: '6px', flexShrink: 0 }}>
                            <div style={{
                                position: 'absolute', inset: 0, borderRadius: '50%',
                                background: isHealthy ? '#10b981' : '#f59e0b',
                                animation: 'iq-pulse 2s ease-in-out infinite',
                                opacity: 0.5,
                            }} />
                            <div style={{
                                position: 'absolute', inset: 0, borderRadius: '50%',
                                background: isHealthy ? '#10b981' : '#f59e0b',
                            }} />
                        </div>
                        <span style={{
                            fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.04em',
                            color: isHealthy ? '#10b981' : '#f59e0b', textTransform: 'uppercase',
                        }}>
                            {rating}
                        </span>
                    </div>
                )}

                {/* ── Structural Diagnosis ── */}
                {diagnosis && (
                    <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                            <Activity size={12} color={accent} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: accent, textTransform: 'uppercase' }}>
                                Structural Diagnosis
                            </span>
                        </div>
                        <p style={{
                            fontSize: '1rem', color: '#d1d5db', lineHeight: '1.75', margin: 0,
                        }}>
                            {diagnosis}
                        </p>
                    </div>
                )}

                {/* ── Performance Summary ── */}
                {perfSummary && (
                    <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                            <TrendingUp size={12} color={accent} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: accent, textTransform: 'uppercase' }}>
                                Performance Summary
                            </span>
                        </div>
                        <p style={{
                            fontSize: '1rem', color: '#d1d5db', lineHeight: '1.75', margin: 0,
                        }}>
                            {perfSummary}
                        </p>
                    </div>
                )}

                {/* ── Why: Causal Reasoning ── */}
                {reasons.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                            <Shield size={12} color={accent} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: accent, textTransform: 'uppercase' }}>
                                Why — Key Drivers
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                            {reasons.map((r, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <span style={{ color: accent, fontSize: '0.5rem', marginTop: '6px', flexShrink: 0 }}>◆</span>
                                    <span style={{ fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.6 }}>{r}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Divider ── */}
                <div style={{
                    height: '1px', margin: '0.25rem 0 1.25rem',
                    background: 'linear-gradient(90deg, var(--glass-border), transparent 80%)',
                }} />

                {/* ── 2-col: Signals + Focus ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0' }}>

                    {/* Detected Signals */}
                    <div style={{
                        padding: '0.875rem 1rem', borderRadius: '10px',
                        background: 'var(--color-surface)',
                        border: '1px solid rgba(245,158,11,0.08)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--color-risk-medium)' }} />
                            <span style={{ fontSize: '0.675rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-risk-medium)', textTransform: 'uppercase' }}>
                                Detected Signals
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {symptoms.length > 0 ? symptoms.map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                                    <span style={{ color: 'var(--color-risk-medium)', fontSize: '0.55rem', marginTop: '5px', flexShrink: 0 }}>●</span>
                                    <span style={{ fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.5 }}>{s}</span>
                                </div>
                            )) : (
                                <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>No abnormal signals detected.</span>
                            )}
                        </div>
                    </div>

                    {/* AI Focus Areas */}
                    <div style={{
                        padding: '0.875rem 1rem', borderRadius: '10px',
                        background: 'var(--color-surface)',
                        border: '1px solid rgba(16,185,129,0.08)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--color-risk-low)' }} />
                            <span style={{ fontSize: '0.675rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-risk-low)', textTransform: 'uppercase' }}>
                                AI Focus Areas
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {prescriptions.length > 0 ? prescriptions.map((p, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                                    <span style={{ color: 'var(--color-risk-low)', fontSize: '0.55rem', marginTop: '5px', flexShrink: 0 }}>●</span>
                                    <span style={{ fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.5 }}>{p}</span>
                                </div>
                            )) : (
                                <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>Portfolio structure is optimal.</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── AI PROMOTION BANNER ── */}
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(90deg, rgba(209, 199, 157, 0.12) 0%, rgba(176, 166, 120, 0.05) 100%)',
                    border: '1px solid rgba(209, 199, 157, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.5rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                            width: '42px', height: '42px', borderRadius: '50%', 
                            background: accent, display: 'flex', alignItems: 'center', 
                            justifyContent: 'center', boxShadow: `0 0 20px ${accent}60`,
                            animation: 'iq-pulse 3s infinite'
                        }}>
                            <Sparkles size={20} color="#000" />
                        </div>
                        <div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '0.2px' }}>
                                Unlock Deep Portfolio Analysis
                            </div>
                            <div style={{ fontSize: '0.8rem', color: accent, fontWeight: 700, marginTop: '2px' }}>
                                1st Structural Diagnostic — COMPLETELY FREE 💎
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => document.querySelector('button[style*="fixed"]').click()} 
                        style={{
                            padding: '0.625rem 1.5rem', borderRadius: '10px', border: 'none',
                            background: accent, color: '#000', fontSize: '0.8125rem', 
                            fontWeight: 800, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: `0 4px 15px ${accent}40`,
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'scale(1.05) translateY(-1px)';
                            e.currentTarget.style.boxShadow = `0 8px 25px ${accent}60`;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'scale(1) translateY(0)';
                            e.currentTarget.style.boxShadow = `0 4px 15px ${accent}40`;
                        }}
                    >
                        Try KIMS AI
                    </button>
                </div>
            </div>

            {/* ═══════ PREMIUM FOOTER ═══════ */}
            <div style={{
                borderTop: '1px solid var(--glass-border)',
            }}>
                {/* Premium header row */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.875rem 1.5rem',
                    borderBottom: '1px solid var(--glass-border)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Lock size={12} color={`${accent}99`} />
                        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            Institutional X-Ray
                        </span>
                        <span style={{
                            fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.1em',
                            color: accent,
                            background: `linear-gradient(135deg, ${accentGlow}, ${accent}08)`,
                            border: `1px solid ${accent}33`,
                            borderRadius: '4px', padding: '0.1rem 0.375rem',
                        }}>PREMIUM</span>
                    </div>
                </div>

                {/* Blurred feature list */}
                <div style={{
                    padding: '1rem 1.5rem',
                    filter: 'blur(2.5px)', opacity: 0.5,
                    pointerEvents: 'none', userSelect: 'none',
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {premiumFeatures.map((feat, i) => {
                            const Icon = feat.icon;
                            return (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.625rem 0.875rem', borderRadius: '8px',
                                    background: 'var(--color-surface)',
                                    border: '1px solid var(--glass-border)',
                                }}>
                                    <Icon size={14} color={feat.color} />
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e5e7eb' }}>{feat.label}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.5rem' }}>{feat.desc}</span>
                                    </div>
                                    <span style={{
                                        fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.08em',
                                        color: feat.color, background: `${feat.color}15`,
                                        border: `1px solid ${feat.color}30`,
                                        borderRadius: '4px', padding: '0.1rem 0.4rem',
                                    }}>{feat.tag}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA row */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid var(--glass-border)',
                    background: `${accent}03`,
                    flexWrap: 'wrap', gap: '0.75rem',
                }}>
                    <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e5e7eb', marginBottom: '0.15rem' }}>
                            Unlock macro risk, bias audit & valuation alerts
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: '#4b5563' }}>
                            3 diagnostics locked · Built for institutional portfolios
                        </div>
                    </div>
                    <button
                        onClick={() => window.location.href = '#premium'}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0,
                            padding: '0.5rem 1.125rem', borderRadius: '8px', cursor: 'pointer',
                            fontSize: '0.8125rem', fontWeight: 700, color: '#0a0a0a',
                            background: `linear-gradient(135deg, ${accent} 0%, #B0A678 100%)`,
                            border: 'none',
                            boxShadow: `0 2px 12px ${accentGlow}`,
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = `0 6px 20px ${accent}40`;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = `0 2px 12px ${accentGlow}`;
                        }}
                    >
                        Upgrade to Premium
                        <ArrowRight size={13} />
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes iq-pulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.8); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default PortfolioIntelligence;
