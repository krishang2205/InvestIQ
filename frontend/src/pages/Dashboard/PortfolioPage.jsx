import PortfolioHero from './components/portfolio/PortfolioHero';
import PortfolioIntelligence from './components/portfolio/PortfolioIntelligence';
import PortfolioAllocation from './components/portfolio/PortfolioAllocation';

const PortfolioPage = () => {
    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500 min-h-screen bg-[#000000] text-gray-100 font-sans">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Portfolio</h1>
                    <p className="text-sm text-gray-400 mt-1">Track your performance and risk metrics.</p>
                </div>
                {/* Placeholder for actions */}
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] border border-white/10 rounded-lg text-sm text-white font-medium transition-all">
                        Connect Broker
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 rounded-lg text-sm text-white font-medium shadow-lg shadow-violet-500/20 transition-all">
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
