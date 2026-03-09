import React from 'react';

const LegendItem = ({ color, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
    <div className="flex flex-col">
      <span className="text-sm text-gray-600 font-medium">{label}</span>
      <span className="text-xs text-gray-400">{value} users</span>
    </div>
  </div>
);

export default LegendItem;