import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StockRow = ({ stock, index, activeTab, logo }) => {
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
                    padding: '6px'
                }}>
                    {logo ? (
                        <img
                            src={logo}
                            alt={stock.symbol}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = isGain ?
                                    '<svg width="20" height="20" ...><path d="..." stroke="#00C853" .../></svg>' :
                                    '<svg width="20" height="20" ...><path d="..." stroke="#FF4D4D" .../></svg>';
                                // Proper fallback logic via parent or icon re-render would be better but this is quick fix
                            }}
                        />
                    ) : (
                        <div style={{ color: color }}>
                            {isGain ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                        </div>
                    )}
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
