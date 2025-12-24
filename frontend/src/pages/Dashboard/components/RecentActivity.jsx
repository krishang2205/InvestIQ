import React from 'react';
import { ArrowRight } from 'lucide-react';

const RecentActivity = () => {
    const activities = [
        { id: 1, action: 'Bought AAPL', time: '2 hours ago', amount: '+$2,400.00' },
        { id: 2, action: 'Sold TSLA', time: '5 hours ago', amount: '-$1,200.00' },
        { id: 3, action: 'Deposit', time: '1 day ago', amount: '+$5,000.00' },
        { id: 4, action: 'Dividend Received', time: '2 days ago', amount: '+$145.20' },
    ];

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Recent Activity</h3>
                <button style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-accent)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    View All <ArrowRight size={16} style={{ marginLeft: '4px' }} />
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activities.map((item) => (
                    <div key={item.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: '1rem',
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div>
                            <p style={{ fontWeight: 500 }}>{item.action}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>{item.time}</p>
                        </div>
                        <span style={{
                            fontWeight: 600,
                            color: item.amount.startsWith('+') ? 'var(--color-risk-low)' : 'var(--color-risk-high)'
                        }}>
                            {item.amount}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentActivity;
