import React, { useState, useRef, useEffect } from 'react';

import { MoreHorizontal } from 'lucide-react';
import IndexDetailCard from './IndexDetailCard';
import useMarketData from '../../../../hooks/useMarketData';

import { IndexItem } from './MarketIndicesComponents';

const MarketIndicesWidget = () => {
    const [activeIndex, setActiveIndex] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const containerRef = useRef(null);

    // Fetch real indices data
    const { data: indicesData, loading, error } = useMarketData('indices', 60000); // 1 min refresh

    // Fallback data if loading or error (optional, or show skeletons)
    // For now, let's just use empty array or previous data
    const indices = indicesData || [];

    // Close card on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Logic kept for potential future use or cleanup
        };
    }, []);

    const handleIndexClick = (e, id) => {
        if (activeIndex === id) {
            setActiveIndex(null);
            setAnchorEl(null);
        } else {
            setActiveIndex(id);
            setAnchorEl(e.currentTarget);
        }
    };

    // Logo Helper
    const getIndexLogo = (name) => {
        if (!name) return '';
        if (name.includes('NIFTY')) return 'https://www.google.com/s2/favicons?domain=nseindia.com&sz=128';
        if (name.includes('SENSEX')) return 'https://www.google.com/s2/favicons?domain=bseindia.com&sz=128';
        return 'https://www.google.com/s2/favicons?domain=google.com&sz=128';
    };

    if (loading && indices.length === 0) {
        return (
            <div className="glass-panel shadow-soft-lift" style={{
                padding: '1.25rem', borderRadius: '16px', height: '100%',
                display: 'flex', flexDirection: 'column'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div className="skeleton-pulse" style={{ width: '120px', height: '20px', borderRadius: '4px' }} />
                    <div className="skeleton-pulse" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', overflow: 'hidden' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                            minWidth: '140px', height: '120px', borderRadius: '10px',
                            backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.85rem',
                            display: 'flex', flexDirection: 'column', gap: '8px'
                        }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <div className="skeleton-pulse" style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
                                <div className="skeleton-pulse" style={{ width: '60px', height: '14px', borderRadius: '4px' }} />
                            </div>
                            <div className="skeleton-pulse" style={{ width: '80px', height: '20px', borderRadius: '4px' }} />
                            <div className="skeleton-pulse" style={{ width: '40px', height: '14px', borderRadius: '4px' }} />
                            <div style={{ marginTop: 'auto' }} className="skeleton-pulse" style={{ width: '100%', height: '30px', borderRadius: '4px' }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error && indices.length === 0) {
        return (
            <div className="glass-panel shadow-soft-lift" style={{ height: '100%', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Indices Unavailable</span>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="glass-panel shadow-soft-lift"
            style={{
                padding: '1.25rem',
                borderRadius: '16px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>Indian Indices</h3>
                <MoreHorizontal size={18} color="var(--color-text-secondary)" style={{ cursor: 'pointer' }} />
            </div>

            <div className="custom-scrollbar" style={{
                flex: 1,
                paddingRight: '0.25rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', // Responsive grid
                gridAutoFlow: 'column', // Force horizontal scroll if needed
                gap: '0.75rem',
                alignContent: 'start',
                overflowX: 'auto',
                overflowY: 'hidden'
            }}>
                {indices.map((index, i) => (
                    <IndexItem
                        key={index.symbol || i}
                        index={index}
                        activeIndex={activeIndex}
                        handleIndexClick={handleIndexClick}
                        getIndexLogo={getIndexLogo}
                        setActiveIndex={setActiveIndex}
                        setAnchorEl={setAnchorEl}
                        anchorEl={anchorEl}
                    />
                ))}
            </div>

            <div style={{
                marginTop: '1rem',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                fontWeight: '600',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }}>
                View all indices
            </div>
        </div>
    );
};

export default MarketIndicesWidget;
