import PortfolioHero from './components/portfolio/PortfolioHero';
import PortfolioIntelligence from './components/portfolio/PortfolioIntelligence';
import PortfolioAllocation from './components/portfolio/PortfolioAllocation';
import PortfolioEmptyState from './components/portfolio/PortfolioEmptyState';
import PortfolioDrillDown from './components/portfolio/PortfolioDrillDown';
import AddTransactionModal from './components/portfolio/AddTransactionModal';
import { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus } from 'lucide-react';


const PortfolioPage = () => {
    const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
    const [transactionInitialData, setTransactionInitialData] = useState(null);
    const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'detailed'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [summary, setSummary] = useState(null);
    const [holdings, setHoldings] = useState([]);
    const [history, setHistory] = useState([]);
    const [intel, setIntel] = useState(null);
    const [xirr, setXirr] = useState(null);

    const HISTORY_DAYS = 180;

    const refresh = useCallback(async () => {
        setError('');
        setLoading(true);
        try {
            const boot = await api.getPortfolioBootstrap();
            setSummary(boot.summary);
            setHoldings(Array.isArray(boot.holdings) ? boot.holdings : []);
            setXirr(boot.xirr ?? null);
        } catch (e) {
            try {
                const [s, h, hist, i, x] = await Promise.all([
                    api.getPortfolioSummary(),
                    api.getPortfolioHoldings(),
                    api.getPortfolioHistory(HISTORY_DAYS),
                    api.getPortfolioIntelligence().catch(() => null),
                    api.getPortfolioXirr().catch(() => null),
                ]);
                setSummary(s);
                setHoldings(Array.isArray(h) ? h : []);
                setHistory(Array.isArray(hist) ? hist : []);
                setIntel(i);
                setXirr(x);
            } catch (e2) {
                setError(e2?.message || e?.message || 'Failed to load portfolio');
            }
            setLoading(false);
            return;
        }
        setLoading(false);

        Promise.all([
            api.getPortfolioHistory(HISTORY_DAYS),
            api.getPortfolioIntelligence().catch(() => null),
        ]).then(([hist, i]) => {
            setHistory(Array.isArray(hist) ? hist : []);
            setIntel(i);
        });
    }, []);

    const openAddTransaction = useCallback((initialData = null) => {
        setTransactionInitialData(initialData);
        setIsAddTransactionOpen(true);
    }, []);

    const handleDeleteStock = useCallback(async (symbol) => {
        if (!window.confirm(`Are you sure you want to delete all transactions for ${symbol}? This cannot be undone.`)) {
            return;
        }
        try {
            await api.removeStock(symbol);
            refresh();
        } catch (e) {
            setError(e?.message || `Failed to delete ${symbol}`);
        }
    }, [refresh]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return (
        <div style={{ padding: '1.5rem', minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-primary)', fontFamily: 'var(--font-family-base)' }} className="animate-in fade-in duration-500">
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '-0.025em', color: 'var(--color-primary)', margin: 0 }}>Portfolio</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)', marginTop: '0.25rem' }}>Track your performance and risk metrics.</p>
                </div>
                {!loading && holdings.length > 0 && (
                    <button
                        onClick={() => openAddTransaction()}
                        style={{
                            padding: '0.625rem 1.25rem',
                            background: 'linear-gradient(135deg, #D1C79D 0%, #B0A678 100%)',
                            color: 'black',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 4px 12px rgba(209, 199, 157, 0.2)',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(209, 199, 157, 0.3)';
                            e.currentTarget.style.opacity = '0.9';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(209, 199, 157, 0.2)';
                            e.currentTarget.style.opacity = '1';
                        }}
                    >
                        <Plus size={18} />
                        Add Investment
                    </button>
                )}

            </div>

            {error && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid rgba(244, 63, 94, 0.3)', background: 'rgba(244, 63, 94, 0.08)', color: '#fecaca' }}>
                    {error}
                </div>
            )}

            {loading ? (
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    Loading portfolio…
                </div>
            ) : holdings.length === 0 ? (
                <PortfolioEmptyState onAddTransaction={() => openAddTransaction()} />
            ) : viewMode === 'detailed' ? (
                <PortfolioDrillDown
                    onBack={() => setViewMode('overview')}
                    holdings={holdings}
                    summary={summary}
                    xirr={xirr}
                    onAddTransaction={openAddTransaction}
                    onDeleteStock={handleDeleteStock}
                />
            ) : (
                <>
                    {/* Section B: Hero Row */}
                    <div style={{ marginBottom: '1.5rem', cursor: 'pointer' }} onClick={() => setViewMode('detailed')}>
                        <PortfolioHero summary={summary} holdings={holdings} intelligence={intel} />
                    </div>

                    {/* Section C: Intelligence Row */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <PortfolioIntelligence intelligence={intel} holdings={holdings} />
                    </div>

                    {/* Section D: Allocation & Rebalancing */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <PortfolioAllocation holdings={holdings} />
                    </div>
                </>
            )}

            <AddTransactionModal
                isOpen={isAddTransactionOpen}
                onClose={() => {
                    setIsAddTransactionOpen(false);
                    setTransactionInitialData(null);
                }}
                onSaved={refresh}
                initialData={transactionInitialData}
            />
        </div>
    );
};

export default PortfolioPage;
