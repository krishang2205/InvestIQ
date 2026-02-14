import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import useMarketData from '../../../../hooks/useMarketData';

const getSourceDomain = (source) => {
    const map = {
        'Economic Times': 'economictimes.indiatimes.com',
        'Moneycontrol': 'moneycontrol.com',
        'Bloomberg': 'bloomberg.com',
        'LiveMint': 'livemint.com',
        'CNBC-TV18': 'cnbctv18.com',
        'Business Standard': 'business-standard.com'
    };
    return map[source] || 'google.com';
};

const NewsItem = ({ title, summary, source, time, type }) => (
    <div style={{
        padding: '0.85rem 1.25rem', // Reduced padding
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
            marginBottom: '0.2rem',
            alignItems: 'flex-start'
        }}>
            <h4 style={{
                fontSize: '0.85rem', // Reduced font size
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
            fontSize: '0.75rem', // Reduced font size
            color: 'var(--color-text-secondary)',
            margin: '0.15rem 0 0.4rem 0',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
        }}>
            {summary}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', color: 'var(--color-text-tertiary)', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <img
                    src={`https://www.google.com/s2/favicons?domain=${getSourceDomain(source)}&sz=64`}
                    alt={source}
                    style={{ width: '12px', height: '12px', borderRadius: '2px' }}
                />
                <span style={{ color: 'var(--color-accent)' }}>{source}</span>
            </div>
            <span>•</span>
            <span>{time}</span>
            {type && <span>•</span>}
            {type && <span>{type}</span>}
        </div>
    </div>
);

const NewsWidget = () => {
    const tabs = ['All', 'News', 'Macro', 'Earnings'];
    const [activeTab, setActiveTab] = useState('All');

    // Fetch real news
    const { data: newsItems, loading, error } = useMarketData('news', 600000); // 10 min refresh

    const displayNews = newsItems || [];

    if (loading && displayNews.length === 0) {
        return (
            <div className="glass-panel shadow-soft-lift" style={{
                borderRadius: '16px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Loading News...</span>
            </div>
        );
    }

    if (error && displayNews.length === 0) {
        return (
            <div className="glass-panel shadow-soft-lift" style={{
                borderRadius: '16px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>News Unavailable</span>
            </div>
        );
    }

    return (
        <div className="glass-panel shadow-soft-lift" style={{
            borderRadius: '16px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <div style={{
                padding: '1.25rem 1.25rem 0 1.25rem', // Reduced padding
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                        Today's news and events
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '600' }}>
                        View all
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1.25rem' }}>
                    {tabs.map(tab => (
                        <div
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '0 0 0.6rem 0',
                                color: activeTab === tab ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                borderBottom: activeTab === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
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
                {displayNews.map((item, idx) => (
                    <NewsItem key={idx} {...item} />
                ))}
            </div>
        </div>
    );
};

export default NewsWidget;
