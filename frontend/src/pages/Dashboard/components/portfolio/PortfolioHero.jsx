import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const data = [
    { name: 'Jan', value: 124000 },
    { name: 'Feb', value: 128000 },
    { name: 'Mar', value: 135000 },
    { name: 'Apr', value: 132000 },
    { name: 'May', value: 140000 },
    { name: 'Jun', value: 148000 },
    { name: 'Jul', value: 155000 },
];

const PortfolioHero = () => {
    const [timeRange, setTimeRange] = useState('1Y');

    return (
        <div className="grid grid-cols-12 gap-6 h-auto lg:h-[340px]">
            {/* Left Card: Performance Graph (60%) */}
            <div className="col-span-12 lg:col-span-7 xl:col-span-8 glass-panel p-6 flex flex-col relative overflow-hidden group min-h-[350px] lg:min-h-0">
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-white/90">Portfolio Performance</h2>
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                            Net Asset Value
                        </div>
                    </div>
                    <div className="flex bg-[#1E1E1E] rounded-lg p-1 border border-white/5">
                        {['1M', '3M', '1Y', 'ALL'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeRange === range
                                    ? 'bg-violet-500/20 text-violet-300 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                tickFormatter={(value) => `$${value / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1E1E1E', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value) => [`$${value.toLocaleString()}`, 'Value']}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Right Card: The Pulse (40%) */}
            <div className="col-span-12 lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
                {/* Total Value & P/L */}
                <div className="glass-panel p-6 flex-1 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-5 opacity-10">
                        <Activity size={120} className="text-violet-500" />
                    </div>

                    <div className="relative z-10">
                        <p className="text-sm font-medium text-gray-400 mb-1">Total Portfolio Value</p>
                        <h3 className="text-4xl font-bold text-white tracking-tight mb-4">$155,420.50</h3>

                        <div className="flex gap-4">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Daily P/L</span>
                                <span className="text-lg font-semibold text-emerald-400 flex items-center gap-1">
                                    <ArrowUpRight size={18} /> +$1,240.50 (0.8%)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Risk Score Badge */}
                <div className="glass-panel p-6 flex items-center justify-between border-l-4 border-l-emerald-500">
                    <div>
                        <p className="text-sm font-medium text-gray-400 mb-1">Composite Risk Score</p>
                        <h4 className="text-2xl font-bold text-white">42/100 <span className="text-sm font-normal text-emerald-400 ml-2">(Low Risk)</span></h4>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Activity size={24} className="text-emerald-500" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortfolioHero;
