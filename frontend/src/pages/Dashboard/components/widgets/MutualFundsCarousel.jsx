import React, { useRef } from 'react';
import { ChevronRight, ChevronLeft, Briefcase, TrendingUp, Shield } from 'lucide-react';

const MFCard = ({ title, returns, label, color, logo }) => (
    <div className="shadow-soft-lift" style={{
        minWidth: '260px',
        padding: '1.25rem',
        borderRadius: '12px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginRight: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.05)'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '8px'
            }}>
                <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                fontSize: '0.7rem',
                padding: '3px 8px',
                borderRadius: '4px',
                color: 'var(--color-text-secondary)'
            }}>
                3Y CAGR
            </div>
        </div>

        <div>
            <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{label}</div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ color: '#00C853', fontWeight: '700', fontSize: '1.1rem' }}>
                {returns}%
            </div>
        </div>
    </div>
);

const MutualFundsCarousel = () => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 300;
            current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const getLogo = (title) => {
        if (title.includes('Smallcase')) return 'https://www.google.com/s2/favicons?domain=smallcase.com&sz=128';
        if (title.includes('Nifty')) return 'https://www.google.com/s2/favicons?domain=nseindia.com&sz=128';
        if (title.includes('Dividend')) return 'https://www.google.com/s2/favicons?domain=itcportal.com&sz=128'; // Example dividend giant or generic
        return 'https://www.google.com/s2/favicons?domain=tickertape.in&sz=128'; // Default branding
    };

    const portfolios = [
        { title: 'Top 100 Stocks', returns: '18.4', label: 'Equity • Large Cap', color: '#42A5F5' },
        { title: 'Momentum Smallcase', returns: '32.1', label: 'Equity • Momentum', color: '#FFA726' },
        { title: 'Low Risk Savers', returns: '12.5', label: 'Debt • Low Risk', color: '#66BB6A' },
        { title: 'Dividend Aristocrats', returns: '15.8', label: 'Equity • Dividend', color: '#AB47BC' },
        { title: 'Nifty Next 50', returns: '21.2', label: 'Equity • Index', color: '#EF5350' },
    ];

    return (
        <div className="glass-panel" style={{
            padding: '1.5rem',
            borderRadius: '16px',
            marginTop: '1.5rem',
            position: 'relative',
            overflow: 'hidden' // Clean clip
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                    Ready-made Portfolios
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => scroll('left')} style={{
                        padding: '6px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
                        background: 'transparent', color: '#fff'
                    }}>
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => scroll('right')} style={{
                        padding: '6px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
                        background: 'transparent', color: '#fff'
                    }}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="custom-scrollbar"
                style={{
                    display: 'flex',
                    overflowX: 'auto',
                    paddingBottom: '0.5rem',
                    scrollSnapType: 'x mandatory'
                }}
            >
                {portfolios.map((pf, idx) => (
                    <MFCard key={idx} {...pf} logo={getLogo(pf.title)} />
                ))}
            </div>
        </div>
    );
};

export default MutualFundsCarousel;
