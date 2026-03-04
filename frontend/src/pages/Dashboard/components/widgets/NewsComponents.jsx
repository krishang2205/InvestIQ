import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';

const getSourceDomain = (source, link) => {
    const s = source ? source.toLowerCase() : '';
    let linkHostname = null;

    try {
        if (link) {
            linkHostname = new URL(link).hostname.replace('www.', '');
        }
    } catch (e) { }

    // Priority 1: Known Source Names (Exceptions that simple guessing won't catch)
    if (s.includes('economic times') || s.includes('et markets')) return 'economictimes.indiatimes.com';
    if (s.includes('moneycontrol')) return 'moneycontrol.com';
    if (s.includes('cnbc')) return 'cnbctv18.com';
    if (s.includes('ndtv')) return 'ndtvprofit.com';
    if (s.includes('times of india')) return 'timesofindia.indiatimes.com';
    if (s.includes('hindu')) return 'thehindu.com';
    if (s.includes('indian express')) return 'indianexpress.com';
    if (s.includes('motley fool')) return 'fool.com';

    // Priority 2: Smart Guesser (Try to construct domain from name)
    // e.g. "Reuters" -> "reuters.com", "Benzinga" -> "benzinga.com"
    if (s) {
        const cleanName = s.replace(/[^a-z0-9]/g, '');
        if (cleanName.length > 2) {
            return `${cleanName}.com`;
        }
    }

    // Priority 3: Link Hostname (Fallback for when guess fails or source is empty)
    if (linkHostname) return linkHostname;

    return 'google.com';
};

// Helper to generate a consistent color from a string
const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

const SourceLogo = ({ source, link }) => {
    const [imgError, setImgError] = useState(false);
    const domain = getSourceDomain(source, link);
    const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

    // Fallback Initials
    const initials = source ? source.substring(0, 1).toUpperCase() : 'N';
    const fallbackColor = source ? stringToColor(source) : '#666';

    if (imgError || !source) {
        return (
            <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                backgroundColor: fallbackColor,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: '700',
                textTransform: 'uppercase'
            }}>
                {initials}
            </div>
        );
    }

    return (
        <img
            src={logoUrl}
            onError={() => setImgError(true)}
            alt=""
            style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'contain' }}
        />
    );
};

export const NewsItem = ({ title, summary, source, time, type, link }) => {
    // Simple logic to detect "Just now" or "min ago" for badges
    const isNew = time?.includes('Just now') || time?.includes('min ago');

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
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: 'var(--color-text-primary)',
                    lineHeight: '1.4',
                    margin: 0,
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
                    <SourceLogo source={source} link={link} />
                    <span style={{ color: 'var(--color-accent)', fontWeight: '600' }}>{source}</span>
                </div>
                <span style={{ opacity: 0.5 }}>•</span>
                <span>{time}</span>
                {type && (
                    <>
                        <span style={{ opacity: 0.5 }}>•</span>
                        <span style={{
                            backgroundColor: type === 'Earnings' ? 'rgba(255, 167, 38, 0.15)' :
                                type === 'Macro' ? 'rgba(66, 165, 245, 0.15)' : 'rgba(255,255,255,0.05)',
                            color: type === 'Earnings' ? '#FFA726' :
                                type === 'Macro' ? '#42A5F5' : 'var(--color-text-secondary)',
                            fontWeight: '600',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            border: `1px solid ${type === 'Earnings' ? 'rgba(255, 167, 38, 0.2)' :
                                type === 'Macro' ? 'rgba(66, 165, 245, 0.2)' : 'rgba(255,255,255,0.05)'}`
                        }}>{type}</span>
                    </>
                )}

            </div>
        </div>
    );
};
