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
                        background: 'linear-gradient(135deg, #D1C79D 0%, #B0A678 100%)', // Gold Gradient
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#000', // Black text on Gold
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(209, 199, 157, 0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: 'none'
                    }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 6px 16px rgba(209, 199, 157, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(209, 199, 157, 0.2)';
                        }}
                    >
                        Add Transaction
                    </button>
                </div>
            </div>

            {/* Section B: Hero Row */}
            <div style={{ marginBottom: '1.5rem' }}>
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
        </div>
    );
};

export default PortfolioPage;
