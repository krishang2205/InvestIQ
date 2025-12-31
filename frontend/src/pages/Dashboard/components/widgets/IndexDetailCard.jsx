import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Bookmark, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const IndexDetailCard = ({ indexData, onClose, anchorEl }) => {
    const cardRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    // Mock Chart Data
    const data = Array.from({ length: 50 }, (_, i) => ({
        name: i,
        value: indexData.price * (0.9 + Math.random() * 0.2)
    }));

    const isPositive = indexData.change >= 0;
    const color = isPositive ? '#00C853' : '#FF4D4D';

    useEffect(() => {
        if (anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            // Position to the right of the anchor, vertically aligned with top
            setPosition({
                top: rect.top + window.scrollY,
                left: rect.right + 10 + window.scrollX
            });
        }
    }, [anchorEl]);

    // Handle clicking outside/escape
    useEffect(() => {
        const handleClickOutside = (event) => {
            // If clicking the anchor itself, let the parent handle the toggle
            if (anchorEl && anchorEl.contains(event.target)) return;

            if (cardRef.current && !cardRef.current.contains(event.target)) {
                onClose();
            }
        };
        const handleScroll = () => {
            // Close on scroll to avoid alignment issues for now (simple approach)
            onClose();
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [onClose, anchorEl]);

    const content = (
        <div
            ref={cardRef}
            className="animate-in fade-in zoom-in-95 duration-200"
            style={{
                position: 'fixed', // Fixed to ensure it's relative to the window
                top: position.top,
                left: position.left,
                width: '380px',
                backgroundColor: '#1E1E1E',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                zIndex: 9999, // Ensure on top of everything
                padding: '1.25rem',
                color: '#fff',
                fontFamily: 'Inter, sans-serif'
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '2px' }}>{indexData.name}</h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>{indexData.symbol}</div>
                    </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#E0C87F' }}>Wait</span> <span>→</span> <span>Index</span> <span>→</span> <span>{indexData.name}</span>
                </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '1rem' }} />

            {/* Description */}
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                {indexData.description || `The ${indexData.name} represents the top companies based on full market capitalisation from the sector. The index tracks the behavior of a portfolio of blue chip companies.`}
                <span style={{ color: '#2196F3', cursor: 'pointer', marginLeft: '4px' }}>Read more</span>
            </p>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

                {/* Price Section */}
                <div style={{ gridColumn: '1 / -1', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Last Price</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{indexData.price.toLocaleString()}</div>
                    <div style={{ fontSize: '0.85rem', color: color, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(indexData.change)}% (1D)
                    </div>
                </div>

                {/* Left Column Stats */}
                <div>
                    <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>1M Return</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#FF4D4D' }}>-0.63%</div>
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>52W High</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{(indexData.price * 1.1).toFixed(2)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Constituents</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{indexData.constituents || 50}</div>
                    </div>
                </div>

                {/* Right Column Stats */}
                <div>
                    <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>1Y Return</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#00C853' }}>+8.96%</div>
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>52W Low</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{(indexData.price * 0.8).toFixed(2)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>M Cap Share</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>58.77%</div>
                    </div>
                </div>
            </div>

            {/* Sparkline Chart */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Price Trend - 1YR</div>
                <div style={{ height: '60px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="value" stroke={color} fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'transparent',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                }}>
                    <Bookmark size={16} /> Watchlist
                </button>
                <button style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'var(--color-bg)', // Dark bg
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: '#202020'
                }}>
                    View details
                </button>
            </div>
        </div>
    );

    return ReactDOM.createPortal(content, document.body);
};

export default IndexDetailCard;
