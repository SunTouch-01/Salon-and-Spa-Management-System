import React from 'react';

const DemoWatermark = ({ trialEndDate }) => {
    if (!trialEndDate) return null;

    const end = new Date(trialEndDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
        return (
            <div className="fixed bottom-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm animate-pulse">
                Trial Expired! Please Upgrade.
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-xs font-bold tracking-wide">
                DEMO MODE: {diffDays} Day{diffDays !== 1 ? 's' : ''} Left
            </span>
        </div>
    );
};

export default DemoWatermark;
