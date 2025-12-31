import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const TickerItem = ({ symbol, price, change, isPositive }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0 1.5rem',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        whiteSpace: 'nowrap'
    }}>
        <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
            {symbol}
        </span>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
            {price.toLocaleString()}
        </span>
        <span style={{
            fontSize: '0.8rem',
            color: isPositive ? '#00C853' : '#FF4D4D',
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
        }}>
            {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {change}%
        </span>
    </div>
);

const Ticker = () => {
    // Mock Data simulating Tickertape's top bar
    const items = [
        { symbol: 'NIFTY 50', price: 21741.90, change: 0.54, isPositive: true },
        { symbol: 'SENSEX', price: 72038.43, change: 0.49, isPositive: true },
        { symbol: 'NIFTY BANK', price: 48292.25, change: -0.15, isPositive: false },
        { symbol: 'BAJFINANCE', price: 7720.40, change: 1.25, isPositive: true },
        { symbol: 'HDFCBANK', price: 1680.50, change: -0.45, isPositive: false },
        { symbol: 'RELIANCE', price: 2750.00, change: 1.80, isPositive: true },
        { symbol: 'TCS', price: 3890.15, change: 0.35, isPositive: true },
        { symbol: 'INFY', price: 1670.30, change: -1.20, isPositive: false },
        { symbol: 'SBIN', price: 630.15, change: 0.90, isPositive: true },
        { symbol: 'USD/INR', price: 83.12, change: -0.05, isPositive: false },
        { symbol: 'GOLD', price: 63250.00, change: 0.22, isPositive: true },
    ];

    // Double the items for seamless loop
    const tickerItems = [...items, ...items];

    return (
        <div style={{
            width: '100%',
            height: '40px',
            backgroundColor: 'rgba(20, 20, 20, 0.8)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            position: 'relative'
        }}>
            {/* Gradient masks for smooth fade edges */}
            <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: '40px', zIndex: 2,
                background: 'linear-gradient(90deg, #000 0%, transparent 100%)'
            }} />
            <div style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: '40px', zIndex: 2,
                background: 'linear-gradient(270deg, #000 0%, transparent 100%)'
            }} />

            <div className="ticker-track" style={{
                display: 'flex',
                animation: 'scroll 40s linear infinite',
                width: 'max-content'
            }}>
                {tickerItems.map((item, index) => (
                    <TickerItem key={`${item.symbol}-${index}`} {...item} />
                ))}
            </div>

            <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .ticker-track:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default Ticker;
