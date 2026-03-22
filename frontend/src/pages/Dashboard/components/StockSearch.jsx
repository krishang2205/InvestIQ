import React, { useState, useMemo } from 'react';
import { Search, Check } from 'lucide-react';

const MOCK_STOCKS = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Energy' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'Technology' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Financials' },
    { symbol: 'INFY', name: 'Infosys Ltd', sector: 'Technology' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', sector: 'Financials' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', sector: 'Consumer Goods' },
    { symbol: 'ITC', name: 'ITC Ltd', sector: 'Consumer Goods' },
    { symbol: 'SBIN', name: 'State Bank of India', sector: 'Financials' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', sector: 'Telecommunication' },
    { symbol: 'LICI', name: 'Life Insurance Corp of India', sector: 'Financials' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', sector: 'Automotive' },
];

const StockSearch = ({ onSelect }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    // ⭐ Improved ranking logic
    const filteredStocks = useMemo(() => {
        const q = query.toLowerCase().trim();

        if (!q) return [];

        return MOCK_STOCKS
            .map(stock => {
                const symbol = stock.symbol.toLowerCase();
                const name = stock.name.toLowerCase();

                let score = 999;

                if (symbol === q) score = 1;
                else if (symbol.startsWith(q)) score = 2;
                else if (name.startsWith(q)) score = 3;
                else if (symbol.includes(q)) score = 4;
                else if (name.includes(q)) score = 5;

                return { ...stock, score };
            })
            .filter(s => s.score < 999)
            .sort((a, b) => a.score - b.score)
            .slice(0, 8);
    }, [query]);

    const handleSelect = (stock) => {
        setSelected(stock);
        setQuery(`${stock.symbol} - ${stock.name}`);
        setIsOpen(false);

        // ✅ IMPORTANT: Send correct structure
        onSelect({
            symbol: stock.symbol,
            name: stock.name
        });
    };

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ position: 'relative' }}>
                <Search
                    size={20}
                    style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        color: '#9ca3af'
                    }}
                />

                <input
                    type="text"
                    placeholder="Search stock (e.g., RELIANCE)..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="glass-panel"
                    style={{
                        width: '100%',
                        padding: '1rem 1rem 1rem 3rem',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none',
                        color: 'var(--color-primary)',
                        transition: 'box-shadow 0.2s',
                        border: isOpen ? '1px solid var(--color-accent)' : '1px solid var(--glass-border)'
                    }}
                />
            </div>

            {/* Trending */}
            {!query && (
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-secondary)' }}>Trending:</span>

                    {MOCK_STOCKS.slice(0, 4).map(stock => (
                        <button
                            key={stock.symbol}
                            onClick={() => handleSelect(stock)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '20px',
                                padding: '0.25rem 0.75rem',
                                color: 'var(--color-secondary)',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                            }}
                        >
                            {stock.symbol}
                        </button>
                    ))}
                </div>
            )}

            {/* Dropdown */}
            {isOpen && query && (
                <div className="glass-panel" style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    width: '100%',
                    borderRadius: '12px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 100,
                    padding: '0.5rem'
                }}>
                    {filteredStocks.length > 0 ? filteredStocks.map(stock => (
                        <div
                            key={stock.symbol}
                            onClick={() => handleSelect(stock)}
                            style={{
                                padding: '0.75rem 1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderRadius: '8px',
                                color: 'var(--color-primary)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div>
                                <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>
                                    {stock.symbol}
                                </span>
                                <span style={{ color: 'var(--color-secondary)' }}>
                                    {stock.name}
                                </span>
                            </div>

                            {selected?.symbol === stock.symbol && (
                                <Check size={16} color="var(--color-accent)" />
                            )}
                        </div>
                    )) : (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-secondary)' }}>
                            No stocks found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StockSearch;