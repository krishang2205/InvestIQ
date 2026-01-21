import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, DollarSign, Hash, Check } from 'lucide-react';

const INDIAN_STOCKS = [
    "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "HINDUNILVR", "SBIN", "BHARTIARTL", "ITC", "KOTAKBANK",
    "LTIM", "AXISBANK", "LT", "HCLTECH", "BAJFINANCE", "ASIANPAINT", "MARUTI", "SUNPHARMA", "TITAN", "ULTRACEMCO",
    "TATASTEEL", "NTPC", "POWERGRID", "M&M", "JSWSTEEL", "ADANIENT", "ADANIGREEN", "ADANIPORTS", "COALINDIA", "ONGC",
    "TATAMOTORS", "BAJAJFINSV", "NESTLEIND", "BPCL", "GRASIM", "BRITANNIA", "TECHM", "WIPRO", "HINDALCO", "CIPLA",
    "EICHERMOT", "DRREDDY", "DIVISLAB", "SBILIFE", "HDFCLIFE", "APOLLOHOSP", "TATACONSUM", "UPL", "HEROMOTOCO"
];

const AddTransactionModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        type: 'buy', // buy | sell
        assetSegment: 'equity', // equity | mf | gold | bonds
        symbol: '',
        date: new Date().toISOString().split('T')[0],
        quantity: '',
        price: '',
    });

    const [totalValue, setTotalValue] = useState(0);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    // Auto-calculate total value
    useEffect(() => {
        const qty = parseFloat(formData.quantity) || 0;
        const price = parseFloat(formData.price) || 0;
        setTotalValue(qty * price);
    }, [formData.quantity, formData.price]);

    // Handle outside click to close suggestions
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSymbolChange = (e) => {
        const value = e.target.value.toUpperCase();
        setFormData({ ...formData, symbol: value });

        if (value.length > 0) {
            const filtered = INDIAN_STOCKS.filter(stock =>
                stock.includes(value)
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const selectStock = (stock) => {
        setFormData({ ...formData, symbol: stock });
        setShowSuggestions(false);
    };

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically call an API
        console.log('Transaction submitted:', formData);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.6)'
        }}
            className="animate-in fade-in duration-200"
        >
            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '500px',
                padding: '0',
                borderRadius: '16px',
                border: '1px solid var(--glass-border)',
                backgroundColor: '#1a1a1a',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', margin: 0 }}>Add Transaction</h2>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Transaction Type Toggle */}
                    <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '0.5rem' }}>
                        {['buy', 'sell'].map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setFormData({ ...formData, type })}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem',
                                    borderRadius: '0.375rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    backgroundColor: formData.type === type ? (type === 'buy' ? '#10b981' : '#ef4444') : 'transparent',
                                    color: formData.type === type ? 'white' : '#9ca3af',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* Asset Segment */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Asset Segment</label>
                        <select
                            value={formData.assetSegment}
                            onChange={(e) => setFormData({ ...formData, assetSegment: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.5rem',
                                color: 'white',
                                outline: 'none'
                            }}
                        >
                            <option value="equity">Equity (Stocks)</option>
                            <option value="mf">Mutual Fund</option>
                            <option value="gold">Gold / Commodities</option>
                            <option value="bonds">Bonds / Fixed Income</option>
                        </select>
                    </div>

                    {/* Symbol & Date Row */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1, position: 'relative' }} ref={wrapperRef}>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Symbol / Ticker</label>
                            <input
                                type="text"
                                placeholder="e.g. RELIANCE"
                                value={formData.symbol}
                                onChange={handleSymbolChange}
                                onFocus={() => formData.symbol && setShowSuggestions(true)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    outline: 'none'
                                }}
                                required
                            />
                            {/* Autocomplete Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <ul style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    backgroundColor: '#262626',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '0.5rem',
                                    marginTop: '0.25rem',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    zIndex: 100,
                                    listStyle: 'none',
                                    padding: '0.25rem 0',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                                }}>
                                    {suggestions.map((stock) => (
                                        <li
                                            key={stock}
                                            onClick={() => selectStock(stock)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                cursor: 'pointer',
                                                color: '#e5e7eb',
                                                fontSize: '0.875rem',
                                                transition: 'background-color 0.1s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(209, 199, 157, 0.1)';
                                                e.currentTarget.style.color = '#D1C79D';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = '#e5e7eb';
                                            }}
                                        >
                                            {stock}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Date</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        paddingLeft: '2.5rem',
                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        outline: 'none',
                                        colorScheme: 'dark'
                                    }}
                                    required
                                />
                                <Calendar size={16} color="#9ca3af" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                            </div>
                        </div>
                    </div>

                    {/* Qty & Price Row */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Quantity</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        paddingLeft: '2.5rem',
                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                    required
                                    min="0"
                                    step="any"
                                />
                                <Hash size={16} color="#9ca3af" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Price per Unit (₹)</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        paddingLeft: '2.5rem',
                                        backgroundColor: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                    required
                                    min="0"
                                    step="any"
                                />
                                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '0.875rem' }}>₹</span>
                            </div>
                        </div>
                    </div>

                    {/* Total Value Display */}
                    <div style={{ padding: '1rem', backgroundColor: 'rgba(209, 199, 157, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(209, 199, 157, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', color: '#D1C79D' }}>Total Value</span>
                        <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            background: 'linear-gradient(135deg, #D1C79D 0%, #B0A678 100%)',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            color: '#000',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            marginTop: '0.5rem',
                            boxShadow: '0 4px 12px rgba(209, 199, 157, 0.2)',
                            transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                        Add Transaction
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddTransactionModal;
