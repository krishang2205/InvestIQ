import React from 'react';
import { TrendingUp, Zap, ShieldCheck, DollarSign, ChevronRight } from 'lucide-react';

const StrategyCard = ({ icon: Icon, title, description, color, className }) => (
    <div
        className={`strategy-card ${className}`}
        style={{
            padding: '1.5rem',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', // Subtle gradient
            cursor: 'pointer',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            minHeight: '140px'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = `${color}40`; // 25% opacity border color
            e.currentTarget.style.boxShadow = `0 10px 30px -10px ${color}20`; // Soft colored glow
            e.currentTarget.style.transform = 'translateY(-4px)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
        }}
    >
        {/* Glow Element (Background Blob) */}
        <div style={{
            position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
            background: `radial-gradient(circle at 50% 50%, ${color}10 0%, transparent 50%)`,
            opacity: 0, transition: 'opacity 0.3s ease', pointerEvents: 'none'
        }} className="card-glow" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            {/* Icon Container */}
            <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                backgroundColor: `${color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color,
                boxShadow: `0 4px 12px ${color}15`, // Subtle inner glow
                transition: 'transform 0.3s ease'
            }}>
                <Icon size={24} strokeWidth={2} />
            </div>

            {/* Hover Chevron */}
            <div className="hover-chevron" style={{
                opacity: 0,
                transform: 'translateX(-10px)',
                transition: 'all 0.3s ease',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                padding: '4px'
            }}>
                <ChevronRight size={16} />
            </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto' }}>
            <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>{title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: '1.5', opacity: 0.8 }}>{description}</div>
        </div>

        <style>{`
            .strategy-card:hover .card-glow {
                opacity: 1 !important;
            }
            .strategy-card:hover .hover-chevron {
                opacity: 1 !important;
                transform: translateX(0) !important;
            }
        `}</style>
    </div>
);

const ScreenerShortcutWidget = () => {
    const strategies = [
        { icon: TrendingUp, title: 'Near 52W Low', description: 'Good stocks at bargain prices', color: '#00C853', glowClass: 'hover-glow-green' },
        { icon: Zap, title: 'Momentum Trap', description: 'Stocks gaining strong momentum', color: '#FFD740', glowClass: 'hover-glow-gold' },
        { icon: ShieldCheck, title: 'Low Debt', description: 'Companies with zero or low debt', color: '#448AFF', glowClass: 'hover-glow-blue' },
        { icon: DollarSign, title: 'High Dividend', description: 'Steady income generating stocks', color: '#E040FB', glowClass: 'hover-glow-purple' },
    ];

    return (
        <div className="glass-panel shadow-soft-lift" style={{
            padding: '1.5rem',
            borderRadius: '24px', // More modern rounded styling
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(180deg, rgba(30,30,30,0.6) 0%, rgba(10,10,10,0.8) 100%)' // Darker container
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>Investment Ideas</h3>
                <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'transparent',
                    transition: 'all 0.2s'
                }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    View All Screens
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', flex: 1 }}>
                {strategies.map((strategy) => (
                    <StrategyCard
                        key={strategy.title}
                        {...strategy}
                        className={strategy.glowClass}
                    />
                ))}
            </div>
        </div>
    );
};

export default ScreenerShortcutWidget;
