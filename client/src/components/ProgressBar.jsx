import React from 'react';

export default function ProgressBar({ current, total, label }) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        {label && <span className="text-sm font-medium text-surface-300">{label}</span>}
        <span className="text-sm font-semibold text-primary-300">{percentage}%</span>
      </div>
      <div className="w-full bg-surface-800 rounded-full h-2.5 overflow-hidden border border-surface-700">
        <div 
          className="h-2.5 rounded-full progress-gradient transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
