import PortfolioHero from './components/portfolio/PortfolioHero';
import PortfolioIntelligence from './components/portfolio/PortfolioIntelligence';
import PortfolioAllocation from './components/portfolio/PortfolioAllocation';
import PortfolioEmptyState from './components/portfolio/PortfolioEmptyState';
import PortfolioDrillDown from './components/portfolio/PortfolioDrillDown';
import AddTransactionModal from './components/portfolio/AddTransactionModal';
import { useState } from 'react';

const PortfolioPage = () => {
    // Demo state: Set to true to see data, false to see empty state
    const [hasData, setHasData] = useState(false);
    const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
    const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'detailed'

    return (
        <div style={{ padding: '1.5rem', minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-primary)', fontFamily: 'var(--font-family-base)' }} className="animate-in fade-in duration-500">
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '-0.025em', color: 'var(--color-primary)', margin: 0 }}>Portfolio</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)', marginTop: '0.25rem' }}>Track your performance and risk metrics.</p>
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#2a2a2a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        color: 'white',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#2a2a2a'}
                        onClick={() => setHasData(!hasData)} // Toggle for demo purposes
                    >
                        {hasData ? 'View Empty State' : 'View Demo Data'}
                    </button>
                </div>
            </div>

            {!hasData ? (
                <PortfolioEmptyState onAddTransaction={() => setIsAddTransactionOpen(true)} />
            ) : viewMode === 'detailed' ? (
                <PortfolioDrillDown onBack={() => setViewMode('overview')} />
            ) : (
                <>
                    {/* Section B: Hero Row */}
                    <div style={{ marginBottom: '1.5rem', cursor: 'pointer' }} onClick={() => setViewMode('detailed')}>
                        <PortfolioHero />
                    </div>

                    {/* Section C: Intelligence Row */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <PortfolioIntelligence />
                    </div>

                    {/* Section D: Allocation & Rebalancing */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <PortfolioAllocation />
                    </div>
                </>
            )}

            <AddTransactionModal
                isOpen={isAddTransactionOpen}
                onClose={() => setIsAddTransactionOpen(false)}
            />
        </div>
    );
};

export default PortfolioPage;
