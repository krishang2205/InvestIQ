import React from 'react';
import { TrendingUp, Zap, ShieldCheck, DollarSign, ChevronRight } from 'lucide-react';

const StrategyCard = ({ icon: Icon, title, description, color, className }) => (
    <div
        className={`strategy-card ${className} shadow-soft-lift`}
        style={{
            padding: '1.25rem',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            cursor: 'pointer',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                backgroundColor: `${color}15`, color: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 0.3s ease'
            }}>
                <Icon size={20} />
            </div>
            {/* Hover Chevron */}
            <div className="hover-chevron" style={{
                opacity: 0,
                transform: 'translateX(-10px)',
                transition: 'all 0.3s ease',
                color: 'var(--color-text-secondary)'
            }}>
                <ChevronRight size={18} />
            </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>{title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>{description}</div>
        </div>

        {/* CSS for hover internal logic */}
        <style>{`
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
        { icon: Zap, title: 'Momentum Trap', description: 'Stocks gaining strong momentum', color: '#FFCA28', glowClass: 'hover-glow-gold' },
        { icon: ShieldCheck, title: 'Low Debt', description: 'Companies with zero or low debt', color: '#42A5F5', glowClass: 'hover-glow-blue' }, // Define blue in global if needed, defaulting generic
        { icon: DollarSign, title: 'High Dividend', description: 'Steady income generating stocks', color: '#AB47BC', glowClass: 'hover-glow-purple' },
    ];

    return (
        <div className="glass-panel shadow-soft-lift" style={{
            padding: '1.5rem',
            borderRadius: '16px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>Investment Ideas</h3>
                <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.05)'
                }}>
                    All Screens
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', flex: 1 }}>
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
