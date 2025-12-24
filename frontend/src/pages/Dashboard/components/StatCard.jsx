import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, change, trend, icon: Icon }) => {
    const isPositive = trend === 'up';

    return (
        <div className="glass-panel" style={{
            padding: '1.5rem',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            transition: 'transform 0.2s',
            cursor: 'default'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ color: 'var(--color-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{title}</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</h3>
                </div>
                {Icon && (
                    <div style={{
                        padding: '0.5rem',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--color-accent)'
                    }}>
                        <Icon size={20} />
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: isPositive ? 'var(--color-risk-low)' : 'var(--color-risk-high)',
                    fontWeight: 500
                }}>
                    {isPositive ? <ArrowUpRight size={16} style={{ marginRight: '2px' }} /> : <ArrowDownRight size={16} style={{ marginRight: '2px' }} />}
                    {change}
                </span>
                <span style={{ color: 'var(--color-secondary)' }}>from last month</span>
            </div>
        </div>
    );
};

export default StatCard;
