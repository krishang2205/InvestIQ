import PortfolioHero from './components/portfolio/PortfolioHero';
import PortfolioIntelligence from './components/portfolio/PortfolioIntelligence';
import PortfolioAllocation from './components/portfolio/PortfolioAllocation';

const PortfolioPage = () => {
    return (
        <div style={{ padding: '1.5rem', minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-primary)', fontFamily: 'var(--font-family-base)' }} className="animate-in fade-in duration-500">
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '-0.025em', color: 'var(--color-primary)', margin: 0 }}>Portfolio</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)', marginTop: '0.25rem' }}>Track your performance and risk metrics.</p>
                </div>
                {/* Placeholder for actions */}
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
                    >
                        Connect Broker
                    </button>
                    <button style={{
                        padding: '0.5rem 1rem',
                        background: 'linear-gradient(to right, #7c3aed, #c026d3)',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        color: 'white',
                        fontWeight: 500,
                        boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: 'none'
                    }}
                        onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                        Add Transaction
                    </button>
                </div>
            </div>

            {/* Section B: Hero Row */}
            <PortfolioHero />

            {/* Section C: Intelligence Row */}
            <PortfolioIntelligence />

            {/* Section D: Allocation & Rebalancing */}
            <PortfolioAllocation />
        </div>
    );
};

export default PortfolioPage;
