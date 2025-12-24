import React from 'react';
import DashboardLayout from './components/DashboardLayout';
import StatCard from './components/StatCard';
import RecentActivity from './components/RecentActivity';
import { DollarSign, TrendingUp, Wallet, BarChart2 } from 'lucide-react';

const DashboardPage = () => {
    return (
        <DashboardLayout>
            {/* Welcome Section */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Welcome back, <span className="text-gradient-gold">Alex</span>
                </h1>
                <p style={{ color: 'var(--color-secondary)' }}>
                    Here's what's happening with your portfolio today.
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <StatCard
                    title="Total Portfolio"
                    value="$124,592.00"
                    change="+12.5%"
                    trend="up"
                    icon={Wallet}
                />
                <StatCard
                    title="Total Gain"
                    value="$8,430.50"
                    change="+5.2%"
                    trend="up"
                    icon={TrendingUp}
                />
                <StatCard
                    title="Day Return"
                    value="-$342.20"
                    change="-0.8%"
                    trend="down"
                    icon={BarChart2}
                />
                <StatCard
                    title="Buying Power"
                    value="$12,050.00"
                    change="+0.0%"
                    trend="up"
                    icon={DollarSign}
                />
            </div>

            {/* Main Content Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '1.5rem',
                alignItems: 'start'
            }}>
                {/* Chart Section (Placeholder for now) */}
                <div className="glass-panel" style={{
                    padding: '1.5rem',
                    borderRadius: '16px',
                    minHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Portfolio Performance</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['1D', '1W', '1M', '1Y', 'ALL'].map(period => (
                                <button key={period} style={{
                                    background: period === '1M' ? 'var(--color-accent-glow)' : 'transparent',
                                    color: period === '1M' ? 'var(--color-accent)' : 'var(--color-secondary)',
                                    border: 'none',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                }}>
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Simple CSS Chart Placeholder */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        paddingTop: '2rem'
                    }}>
                        {[40, 65, 55, 80, 70, 90, 85, 95, 80, 88].map((h, i) => (
                            <div key={i} style={{
                                width: '100%',
                                height: `${h}%`,
                                background: 'linear-gradient(to top, var(--color-accent-glow), transparent)',
                                borderRadius: '4px',
                                position: 'relative'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '4px',
                                    background: 'var(--color-accent)',
                                    borderRadius: '4px'
                                }}></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <RecentActivity />
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;
