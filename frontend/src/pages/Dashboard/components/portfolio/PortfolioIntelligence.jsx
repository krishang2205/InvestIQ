import React from 'react';
import { motion } from 'framer-motion';
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
        <div style={{
            overflow: 'hidden',
            padding: '0 0.5rem',
        }}>
            {/* ── Header Row (Uncontained) ── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1.5rem 0',
                borderBottom: '1px solid var(--glass-border)',
                marginBottom: '2rem'
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

            {/* ═══════ BODY (Expansive) ═══════ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* ── Status + Rating ── */}
                    {rating && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.3rem 0.625rem', borderRadius: '6px', width: 'fit-content',
                                background: isHealthy ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                                border: `1px solid ${isHealthy ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                            }}
                        >
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
                        </motion.div>
                    )}

                    {/* ── Structural Diagnosis ── */}
                    {diagnosis && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
                                <Activity size={12} color={accent} />
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', color: accent, textTransform: 'uppercase' }}>
                                    Structural Diagnosis
                                </span>
                            </div>
                            <p style={{
                                fontSize: '1.25rem', color: '#e5e7eb', lineHeight: '1.6', margin: 0, fontWeight: 500,
                                maxWidth: '800px'
                            }}>
                                {diagnosis}
                            </p>
                        </motion.div>
                    )}

                    {/* ── Performance Summary ── */}
                    {perfSummary && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
                                <TrendingUp size={12} color={accent} />
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', color: accent, textTransform: 'uppercase' }}>
                                    Performance Summary
                                </span>
                            </div>
                            <p style={{
                                fontSize: '1.125rem', color: '#9ca3af', lineHeight: '1.6', margin: 0,
                                maxWidth: '800px'
                            }}>
                                {perfSummary}
                            </p>
                        </motion.div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* ── Why: Causal Reasoning ── */}
                    {reasons.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '1rem' }}>
                                <Shield size={12} color={accent} />
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', color: accent, textTransform: 'uppercase' }}>
                                    Why — Key Drivers
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {reasons.map((r, i) => (
                                    <div key={i} style={{ 
                                        display: 'flex', alignItems: 'flex-start', gap: '1rem',
                                        padding: '1.25rem', borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                    }}>
                                        <span style={{ color: accent, fontSize: '1rem', flexShrink: 0 }}>◆</span>
                                        <span style={{ fontSize: '0.9375rem', color: '#d1d5db', lineHeight: 1.6 }}>{r}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* ── Signals + Focus Section ── */}
            <div style={{ marginTop: '3rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

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
            </div>

            {/* ═══════ PREMIUM FOOTER ═══════ */}
            <div style={{
                borderTop: '1px solid var(--glass-border)',
                marginTop: '3rem'
            }}>
                {/* Premium header row */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.875rem 0',
                    borderBottom: '1px solid var(--glass-border)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Lock size={12} color={`${accent}99`} />
                        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            Institutional X-Ray
                        </span>
                    </div>
                </div>

                {/* Blurred feature list */}
                <div style={{
                    padding: '2rem 0',
                    filter: 'blur(3px)', opacity: 0.5,
                    pointerEvents: 'none', userSelect: 'none',
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        {premiumFeatures.map((feat, i) => {
                            const Icon = feat.icon;
                            return (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '1.25rem', borderRadius: '12px',
                                    background: 'var(--color-surface)',
                                    border: '1px solid var(--glass-border)',
                                }}>
                                    <Icon size={18} color={feat.color} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e5e7eb' }}>{feat.label}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>{feat.desc}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA row */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1.5rem 2rem',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.02)',
                }}>
                    <div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                            Unlock specialized institutional tools
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-secondary)' }}>
                            3 diagnostics locked · Built for heavy institutional portfolios
                        </div>
                    </div>
                    <button
                        onClick={() => window.location.href = '#premium'}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 2rem', borderRadius: '12px', cursor: 'pointer',
                            fontSize: '0.875rem', fontWeight: 700, color: '#000',
                            background: `linear-gradient(135deg, ${accent} 0%, #B0A678 100%)`,
                            border: 'none',
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
