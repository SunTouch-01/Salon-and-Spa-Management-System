import React from 'react';

const KpiCard = ({ title, value, trend, isPositive, icon }) => (
  <div className="flex-1 min-w-60 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-start hover:shadow-md transition-all">
    <div>
      <p className="text-gray-500 text-sm font-medium mb-2">{title}</p>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">{value}</h2>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {trend}
        </span>
        <span className="text-gray-400 text-xs">vs last month</span>
      </div>
    </div>
    <div className="bg-accent-cream p-3 rounded-xl">{icon}</div>
  </div>
);

export default KpiCard;