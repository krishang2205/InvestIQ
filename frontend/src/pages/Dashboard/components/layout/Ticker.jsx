import React from 'react';

const TickerItem = ({ symbol, price, change, isPositive }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginRight: '2rem',
        fontSize: '0.85rem',
        whiteSpace: 'nowrap'
    }}>
        <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{symbol}</span>
        <span style={{ color: 'var(--color-text-secondary)' }}>{price.toLocaleString()}</span>
        <span style={{
            color: isPositive ? '#00C853' : '#FF4D4D',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
        }}>
            {isPositive ? '▲' : '▼'} {Math.abs(change)}%
        </span>
    </div>
);

const Ticker = () => {
    // Mock Data mimicking Tickertape's ticker
    const items = [
        { symbol: 'NIFTY 50', price: 21741.90, change: 0.54, isPositive: true },
        { symbol: 'SENSEX', price: 72038.43, change: 0.49, isPositive: true },
        { symbol: 'NIFTY BANK', price: 48292.25, change: -0.15, isPositive: false },
        { symbol: 'BAJFINANCE', price: 7200.00, change: -0.8, isPositive: false },
        { symbol: 'HDFCBANK', price: 1680.50, change: 1.5, isPositive: true },
        { symbol: 'RELIANCE', price: 2750.00, change: 1.8, isPositive: true },
        { symbol: 'SBIN', price: 630.15, change: -1.9, isPositive: false },
        { symbol: 'TATASTEEL', price: 156.70, change: 3.2, isPositive: true },
        { symbol: 'INFY', price: 1670.30, change: 2.1, isPositive: true },
        { symbol: 'WIPRO', price: 450.20, change: -4.2, isPositive: false },
    ];

    // Duplicate items for seamless loop
    const tickerItems = [...items, ...items];

    return (
        <div style={{
            width: '100%',
            backgroundColor: 'var(--glass-bg)',
            borderBottom: '1px solid var(--glass-border)',
            overflow: 'hidden',
            padding: '0.5rem 0',
            position: 'relative',
            zIndex: 10
        }}>
            <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .ticker-track {
                    display: flex;
                    animation: scroll 30s linear infinite;
                    width: fit-content;
                }
                .ticker-track:hover {
                    animation-play-state: paused;
                }
            `}</style>
            <div className="ticker-track">
                {tickerItems.map((item, index) => (
                    <TickerItem key={`${item.symbol}-${index}`} {...item} />
                ))}
            </div>
        </div>
    );
};

export default Ticker;
