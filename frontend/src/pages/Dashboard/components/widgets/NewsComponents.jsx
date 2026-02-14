import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';

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

export const NewsItem = ({ title, summary, source, time, type, link }) => {
    // Simple logic to detect "Just now" or "min ago" for badges
    const isNew = time?.includes('Just now') || time?.includes('min ago');
    const [imgError, setImgError] = useState(false);

    return (
        <div
            onClick={() => link && window.open(link, '_blank')}
            style={{
                padding: '0.85rem 1.25rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                e.currentTarget.style.paddingLeft = '1.5rem'; // Subtle shift effect
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.paddingLeft = '1.25rem';
            }}
        >
            {isNew && (
                <div style={{
                    position: 'absolute', top: '0.85rem', right: '1.25rem',
                    backgroundColor: 'var(--color-accent)', color: '#000',
                    fontSize: '0.6rem', fontWeight: '800', padding: '2px 6px', borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                    NEW
                </div>
            )}

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.2rem',
                alignItems: 'flex-start',
                paddingRight: isNew ? '2rem' : '0' // Make space for badge
            }}>
                <h4 style={{
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: 'var(--color-text-primary)',
                    lineHeight: '1.4',
                    margin: 0,
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {title}
                </h4>
            </div>
            <p style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-secondary)',
                margin: '0.25rem 0 0.5rem 0',
                lineHeight: '1.4',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                opacity: 0.8
            }}>
                {summary}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', color: 'var(--color-text-tertiary)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {!imgError ? (
                        <img
                            src={`https://www.google.com/s2/favicons?domain=${getSourceDomain(source)}&sz=64`}
                            alt={source}
                            style={{ width: '14px', height: '14px', borderRadius: '3px' }}
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <ExternalLink size={12} color="var(--color-text-secondary)" />
                    )}
                    <span style={{ color: 'var(--color-accent)', fontWeight: '500' }}>{source}</span>
                </div>
                <span style={{ opacity: 0.5 }}>•</span>
                <span>{time}</span>
                {type && (
                    <>
                        <span style={{ opacity: 0.5 }}>•</span>
                        <span style={{
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>{type}</span>
                    </>
                )}
            </div>
        </div>
    );
};
