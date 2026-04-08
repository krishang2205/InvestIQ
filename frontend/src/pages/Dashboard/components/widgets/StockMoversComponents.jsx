import React, { useState, useEffect, useMemo } from 'react';
import { Building2 } from 'lucide-react';

import api from '../../../../services/api';

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

// Logo Component with Fallback
export const StockLogo = ({ symbol, name, logoUrl, size = 32 }) => {
    const [hasError, setHasError] = useState(false);
    
    const handleError = () => {
        setHasError(true);
    };

    if (hasError || !logoUrl) {
        return (
            <div 
                style={{ 
                    width: size, 
                    height: size, 
                    borderRadius: '8px', 
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                <Building2 size={size * 0.5} color="rgba(255,255,255,0.2)" />
            </div>
        );
    }

    return (
        <img 
            src={logoUrl} 
            alt={name}
            onError={handleError}
            style={{ 
                width: size, 
                height: size, 
                borderRadius: '8px',
                objectFit: 'contain',
                flexShrink: 0,
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '2px'
            }}
        />
    );
};
