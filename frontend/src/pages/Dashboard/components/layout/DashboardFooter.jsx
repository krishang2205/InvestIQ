import React from 'react';
import { Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';

const FooterSection = ({ title, links }) => (
    <div style={{ flex: 1, minWidth: '150px' }}>
        <h4 style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem' }}>{title}</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {links.map(link => (
                <a key={link} href="#" style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}>
                    {link}
                </a>
            ))}
        </div>
    </div>
);

const DashboardFooter = () => {
    return (
        <div style={{
            marginTop: '3rem',
            padding: '3rem 0',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            color: 'var(--color-text-secondary)'
        }}>
            {/* Top Grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '3rem' }}>
                <FooterSection
                    title="Assets"
                    links={['Stocks', 'Mutual Funds', 'ETFs', 'Gold', 'US Stocks']}
                />
                <FooterSection
                    title="Tools"
                    links={['MMI', 'Stock Screener', 'MF Screener', 'Market Movers', 'Stock Deals']}
                />
                <FooterSection
                    title="Learn & Share"
                    links={['Blog', 'Learn', 'Collections', 'Glossary', 'Community']}
                />
                <div style={{ flex: 1.5 }}>
                    <h4 style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem' }}>
                        InvestIQ for Mobile
                    </h4>
                    <p style={{ fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.5' }}>
                        Join 10 million+ investors who trust Tickertape for their investment decisions.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ width: '120px', height: '40px', backgroundColor: '#333', borderRadius: '8px' }}></div>
                        <div style={{ width: '120px', height: '40px', backgroundColor: '#333', borderRadius: '8px' }}></div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div style={{
                borderTop: '1px solid rgba(255,255,255,0.05)',
                paddingTop: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{ fontSize: '0.8rem' }}>
                    © 2024 InvestIQ. All rights reserved.
                </div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <Twitter size={20} style={{ cursor: 'pointer' }} />
                    <Facebook size={20} style={{ cursor: 'pointer' }} />
                    <Instagram size={20} style={{ cursor: 'pointer' }} />
                    <Linkedin size={20} style={{ cursor: 'pointer' }} />
                </div>
            </div>
        </div>
    );
};

export default DashboardFooter;
