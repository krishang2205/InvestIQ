import React from 'react';

const getSourceDomain = (source) => {
    const map = {
        'Economic Times': 'economictimes.indiatimes.com',
        'Moneycontrol': 'moneycontrol.com',
        'Bloomberg': 'bloomberg.com',
        'LiveMint': 'livemint.com',
        'CNBC-TV18': 'cnbctv18.com',
        'Business Standard': 'business-standard.com',
        'Reuters': 'reuters.com',
        'Financial Express': 'financialexpress.com',
        'NDTV Profit': 'ndtvprofit.com'
    };
    return map[source] || 'google.com';
};

export const NewsItem = ({ title, summary, source, time, type, link }) => (
    <div
        onClick={() => link && window.open(link, '_blank')}
        style={{
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
                    onError={(e) => e.target.style.display = 'none'}
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
