import React, { useState, useEffect, useMemo } from 'react';
import { Building2 } from 'lucide-react';

export const StockRow = ({ stock, index, activeTab, LogoComponent }) => {
    const isGain = stock.change >= 0;
    const color = isGain ? '#00C853' : '#FF4D4D';

    return (
        <div
            className="animate-fade-in"
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.02)',
                marginBottom: '0.5rem',
                border: '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                animationDelay: `${index * 50}ms`
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                e.currentTarget.style.borderColor = 'transparent';
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                    padding: '4px' // slightly reduced padding
                }}>
                    {LogoComponent}
                </div>
                <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '2px' }}>{stock.symbol}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{stock.name}</div>
                </div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                    ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.8rem', color: color, fontWeight: '600' }}>
                    {isGain ? '+' : ''}{stock.change.toFixed(2)} ({stock.percentChange ? stock.percentChange.toFixed(2) + '%' : ''})
                </div>
            </div>
        </div>
    );
};

export const StockLogo = ({ symbol, logoUrl }) => {
    const [imgSource, setImgSource] = useState(null);
    const [hasError, setHasError] = useState(false);

    // Clean symbol
    const cleanSymbol = useMemo(() => symbol.replace('.NS', '').replace('.BO', ''), [symbol]);

    // Determine initial source
    useEffect(() => {
        // 1. TRUST THE BACKEND. If we have a logoUrl (Google S2 with verified domain), use it.
        // It proved to be reliable for ONGC, UPL etc.
        if (logoUrl) {
            setImgSource(logoUrl);
        } else {
            // 2. Default guess using Google S2
            setImgSource(`https://www.google.com/s2/favicons?domain=${cleanSymbol.toLowerCase()}.com&sz=128`);
        }
        setHasError(false);
    }, [logoUrl, cleanSymbol]);

    const handleError = () => {
        // User strictly wants "NO LOGO" (Grey Icon) if the image fails.
        // Google S2 typically returns a "Globe" icon if the domain is valid but has no favicon, 
        // which might be acceptable as a "logo". 
        // If it truly errors out, we show the Grey Building.
        setHasError(true);
    };

    if (hasError) {
        return (
            <div style={{
                width: '100%', height: '100%', borderRadius: '8px',
                backgroundColor: '#2A2A2A', // Grey background
                color: '#666', // Grey Icon
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Building2 size={18} />
            </div>
        );
    }

    return (
        <img
            src={imgSource}
            alt={symbol}
            onError={handleError}
            style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'contain', backgroundColor: 'rgba(255,255,255,0.05)' }}
        />
    );
};
