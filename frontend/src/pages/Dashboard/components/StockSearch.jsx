import React, { useMemo, useState } from 'react';
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

// ✅ same normalize logic as your page (duplicated here for safety)
const normalizeSymbol = (raw, exchange = "NSE") => {
    const s = (raw || "").toString().toUpperCase().trim();
    if (!s) return "";
    if (s.includes(".")) return s;
    const cleaned = s.split(":").pop().trim();
    if (exchange === "BSE") return `${cleaned}.BO`;
    return `${cleaned}.NS`;
};

const StockSearch = ({ onSelect }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const filteredStocks = useMemo(() => {
        const q = query.toLowerCase().trim();
        if (!q) return MOCK_STOCKS;
        return MOCK_STOCKS.filter(s =>
            s.symbol.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q)
        );
    }, [query]);

    const handleSelect = (stock) => {
        const exchange = stock.exchange || "NSE";
        const ticker = stock.ticker || normalizeSymbol(stock.symbol, exchange);

        const enriched = {
            ...stock,
            exchange,
            ticker,     // ✅ normalized (HINDUNILVR.NS)
            symbol: stock.symbol?.toUpperCase?.() || stock.symbol
        };

        setSelected(enriched);
        setQuery(`${enriched.symbol} - ${enriched.name || enriched.symbol}`);
        setIsOpen(false);

        onSelect(enriched); // ✅ parent now always has ticker
    };

    // ✅ Allow user to type any symbol and press Enter to select it
    const handleEnter = (e) => {
        if (e.key !== "Enter") return;

        const raw = query.trim();
        if (!raw) return;

        // user may type: "HINDUNILVR", "HINDUNILVR.NS", "NSE:HINDUNILVR"
        const symbolOnly = raw.toUpperCase().split("-")[0].trim();
        const cleaned = symbolOnly.split(":").pop().trim();

        // build a fallback "custom" stock
        const custom = {
            symbol: cleaned,
            name: cleaned,          // unknown
            sector: '—',
            exchange: "NSE",
        };

        handleSelect(custom);
    };

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ position: 'relative' }}>
                <Search className="text-gray-400" size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }} />
                <input
                    type="text"
                    placeholder="Search stock (e.g., RELIANCE or HINDUNILVR.NS)..."
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleEnter}  // ✅ Enter selects typed symbol
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

            {/* Trending Suggestions - Only show when input is empty */}
            {!query && (
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center' }}>Trending:</span>
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
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-accent)';
                                e.currentTarget.style.color = 'var(--color-accent)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--glass-border)';
                                e.currentTarget.style.color = 'var(--color-secondary)';
                            }}
                        >
                            {stock.symbol}
                        </button>
                    ))}
                </div>
            )}

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
                                transition: 'background 0.2s',
                                color: 'var(--color-primary)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div>
                                <span style={{ fontWeight: 700, marginRight: '0.5rem' }}>{stock.symbol}</span>
                                <span style={{ color: 'var(--color-secondary)' }}>{stock.name}</span>
                            </div>
                            {selected?.symbol === stock.symbol && <Check size={16} color="var(--color-accent)" />}
                        </div>
                    )) : (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-secondary)' }}>
                            No stocks found. Press <b>Enter</b> to use “{query}”.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StockSearch;