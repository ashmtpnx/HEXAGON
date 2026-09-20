import React from 'react';

export default function ProgressBar({ current, total, label }) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5 text-xs font-medium">
        {label && <span className="text-slate-700">{label}</span>}
        <span className="font-mono text-slate-900 font-semibold">{percentage}% ({current}/{total})</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <div 
          className="h-full bg-slate-900 transition-all duration-300 ease-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
