import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: '13-17 Years', value: 25, color: '#81fdffff' },
  { name: '18-29 Years', value: 45, color: '#6cea4dff' },
  { name: '30-45 Years', value: 30, color: '#848588ff' },
];

const Chart = () => (
  <div className="relative w-40 h-40">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
      <span className="text-2xl font-bold text-gray-900">100%</span>
    </div>
  </div>
);

export default Chart;