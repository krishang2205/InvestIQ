import React from 'react';
import { TrendingUp, Zap, ShieldCheck, DollarSign } from 'lucide-react';

const StrategyCard = ({ icon: Icon, title, description, color }) => (
    <div style={{
        padding: '1.25rem',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, background-color 0.2s',
        border: '1px solid rgba(255, 255, 255, 0.05)'
    }}
        onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.transform = 'translateY(0)';
        }}
    >
        <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            backgroundColor: `${color}20`, color: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <Icon size={20} />
        </div>
        <div>
            <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>{description}</div>
        </div>
    </div>
);

const ScreenerShortcutWidget = () => {
    const strategies = [
        { icon: TrendingUp, title: 'Near 52W Low', description: 'Good stocks at bargain prices', color: '#00C853' },
        { icon: Zap, title: 'Momentum Trap', description: 'Stocks gaining strong momentum', color: '#FFCA28' },
        { icon: ShieldCheck, title: 'Low Debt', description: 'Companies with zero or low debt', color: '#42A5F5' },
        { icon: DollarSign, title: 'High Dividend', description: 'Steady income generating stocks', color: '#AB47BC' },
    ];

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>Investment Ideas</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500' }}>All Screens</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {strategies.map((strategy) => (
                    <StrategyCard key={strategy.title} {...strategy} />
                ))}
            </div>
        </div>
    );
};

export default ScreenerShortcutWidget;
