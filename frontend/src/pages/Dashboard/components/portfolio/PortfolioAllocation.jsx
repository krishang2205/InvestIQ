import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
    { name: 'Technology', value: 45, color: '#8b5cf6' }, // Violet
    { name: 'Healthcare', value: 20, color: '#10b981' }, // Emerald
    { name: 'Finance', value: 15, color: '#f59e0b' },    // Amber
    { name: 'Consumer', value: 10, color: '#ec4899' },   // Pink
    { name: 'Cash', value: 10, color: '#64748b' },       // Slate
];

const renderActiveShape = (props) => {
    // Custom active shape logic can be added here if needed
    return props.payload.name;
};

const PortfolioAllocation = () => {
    return (
        <div className="grid grid-cols-12 gap-6">
            {/* Donut Chart Card (Asset Allocation) */}
            <div className="col-span-12 md:col-span-6 lg:col-span-7 glass-panel p-6 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Asset Allocation</h3>
                        <p className="text-sm text-gray-400">Breakdown by Sector</p>
                    </div>
                    <button className="text-xs text-violet-400 hover:text-violet-300">Manage Categories</button>
                </div>

                <div className="flex-1 w-full min-h-[300px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1E1E1E', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value) => [`${value}%`, 'Allocation']}
                            />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                iconType="circle"
                                wrapperStyle={{ fontSize: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none md:pr-24">
                        <div className="text-center">
                            <span className="block text-3xl font-bold text-white">5</span>
                            <span className="text-xs text-gray-400 uppercase tracking-widest">Sectors</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Placeholder for Rebalancing Hints (Values to be added in next commit) */}
            <div className="col-span-12 md:col-span-6 lg:col-span-5 glass-panel p-6 border border-dashed border-white/10 flex items-center justify-center text-gray-500">
                Rebalancing Recommendations module inactive.
            </div>
        </div>
    );
};

export default PortfolioAllocation;
