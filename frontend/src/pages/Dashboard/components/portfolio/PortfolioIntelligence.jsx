import React from 'react';
import { Sparkles, TrendingDown, Zap, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const RiskMetricCard = ({ title, value, subtext, level, trend }) => {
    // Level: low (green), medium (yellow), high (red)
    const colors = {
        low: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
        medium: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
        high: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
    };

    return (
        <div className={`glass-panel p-4 flex flex-col justify-between border ${level === 'high' ? 'border-rose-500/30' : 'border-white/5'} transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg hover:bg-white/[0.02]`}>
            <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <div className="flex items-end gap-2">
                    <span className="text-xl font-bold text-white">{value}</span>
                    <span className={`text-xs ${level === 'high' ? 'text-rose-400' : 'text-gray-400'}`}>{subtext}</span>
                </div>
            </div>

            <div className="mt-3">
                {/* Mini Sparkline Placeholder */}
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${level === 'high' ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: '60%' }}></div>
                </div>
            </div>
        </div>
    );
};

const PortfolioIntelligence = () => {
    return (
        <div className="grid grid-cols-12 gap-6">
            {/* AI Insight Box (Full Width) */}
            <div className="col-span-12 glass-panel p-1 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-transparent pointer-events-none" />

                <div className="p-5 flex gap-4 items-start relative z-10">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/10 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                        <Sparkles className="text-violet-300" size={24} />
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-base font-semibold text-white flex items-center gap-2">
                                AI Portfolio Analysis
                                <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/20">BETA</span>
                            </h3>
                            <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors">View detailed report →</button>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            Your portfolio is heavily weighted towards <span className="text-white font-medium">Technology (45%)</span>, which increases volatility.
                            Consider diversifying into <span className="text-emerald-400 cursor-pointer hover:underline">Government Bonds</span> or <span className="text-emerald-400 cursor-pointer hover:underline">Consumer Staples</span> to balance risk.
                            The recent drop in tech stocks has increased your drawdown risk by <span className="text-rose-400">2.4%</span>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Risk Metrics Grid */}
            <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <RiskMetricCard
                    title="Max Drawdown"
                    value="-12.4%"
                    subtext="vs -15% benchmark"
                    level="low"
                />
                <RiskMetricCard
                    title="Volatility (Beta)"
                    value="1.24"
                    subtext="High sensitivity"
                    level="high"
                />
                <RiskMetricCard
                    title="Sharpe Ratio"
                    value="1.85"
                    subtext="Good returns/risk"
                    level="medium"
                />
                <RiskMetricCard
                    title="Concentration"
                    value="Top 3: 45%"
                    subtext="High Alert"
                    level="high"
                />
            </div>
        </div>
    );
};

export default PortfolioIntelligence;
