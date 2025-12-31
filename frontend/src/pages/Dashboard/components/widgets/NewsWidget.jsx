import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';

const NewsItem = ({ title, summary, source, time, type }) => (
    <div style={{
        padding: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
    }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.25rem',
            alignItems: 'flex-start'
        }}>
            <h4 style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
                lineHeight: '1.4',
                margin: 0,
                flex: 1
            }}>
                {title}
            </h4>
        </div>
        <p style={{
            fontSize: '0.8rem',
            color: 'var(--color-text-secondary)',
            margin: '0.25rem 0 0.5rem 0',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
        }}>
            {summary}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
            <span style={{ color: 'var(--color-accent)' }}>{source}</span>
            <span>•</span>
            <span>{time}</span>
            {type && <span>•</span>}
            {type && <span>{type}</span>}
        </div>
    </div>
);

const NewsWidget = () => {
    const [activeTab, setActiveTab] = useState('News');

    // Mock Data
    const newsItems = [
        {
            title: "Adani Ports to raise up to $500 million quickly via dollar bonds",
            summary: "Adani Ports and Special Economic Zone is looking to raise fast money from the overseas market.",
            source: "Economic Times",
            time: "2 hours ago",
            type: "Equity"
        },
        {
            title: "TCS Q3 Results Preview: Revenue likely to grow 2.5% YoY",
            summary: "Tata Consultancy Services is expected to report a steady quarter despite global headwinds.",
            source: "Moneycontrol",
            time: "4 hours ago",
            type: "Earnings"
        },
        {
            title: "Gold prices hit new all-time high as Fed signals rate cuts",
            summary: "Yellow metal shines as dollar index falls below 102 mark.",
            source: "Bloomberg",
            time: "5 hours ago",
            type: "Commodities"
        },
        {
            title: "Sensex, Nifty barely hold gains as auto stocks slide",
            summary: "Benchmark indices ended flat on Tuesday after a volatile session.",
            source: "LiveMint",
            time: "6 hours ago",
            type: "Market"
        },
    ];

    const tabs = ['All', 'News', 'Macro', 'Earnings'];

    return (
        <div className="glass-panel shadow-soft-lift" style={{
            borderRadius: '16px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <div style={{
                padding: '1.5rem 1.5rem 0 1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                        Today's news and events
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '600' }}>
                        View all
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    {tabs.map(tab => (
                        <div
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '0 0 0.75rem 0',
                                color: activeTab === tab ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                borderBottom: activeTab === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: activeTab === tab ? '600' : '400',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab}
                        </div>
                    ))}
                </div>
            </div>

            <div className="custom-scrollbar" style={{ overflowY: 'auto', flex: 1 }}>
                {newsItems.map((item, idx) => (
                    <NewsItem key={idx} {...item} />
                ))}
            </div>
        </div>
    );
};

export default NewsWidget;
