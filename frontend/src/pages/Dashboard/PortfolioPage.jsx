import React from 'react';

const PortfolioPage = () => {
    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
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

            {/* Placeholder Content */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 h-64 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-gray-500">
                    Portfolio Content Coming Soon...
                </div>
            </div>
        </div>
    );
};

export default PortfolioPage;
