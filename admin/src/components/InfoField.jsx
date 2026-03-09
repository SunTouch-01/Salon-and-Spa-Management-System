import React from 'react';

const InfoField = ({ label, value, fullWidth }) => (
  <div className={fullWidth ? 'col-span-full' : ''}>
    <label className="block text-xs text-gray-500 mb-1 font-medium ml-1">{label}</label>
    <div className="text-sm font-medium text-gray-900 px-4 py-3 bg-bg-light rounded-lg border border-accent-peach/30">
      {value}
    </div>
  </div>
);

export default InfoField;