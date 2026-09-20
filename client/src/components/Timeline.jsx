import React from 'react';
import { CheckCircle, Circle, AlertCircle, Clock } from 'lucide-react';

export default function Timeline({ steps, currentStep }) {
  return (
    <div className="relative border-l border-slate-200 ml-3 md:ml-4 space-y-6">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;

        return (
          <div key={idx} className="relative pl-6 sm:pl-8 group">
            {/* Timeline Dot Indicator */}
            <div className={`absolute -left-[13px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border text-xs bg-white transition-colors ${
              isCompleted 
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
                : isCurrent 
                ? 'border-slate-900 bg-slate-900 text-white font-bold' 
                : 'border-slate-300 text-slate-400'
            }`}>
              {isCompleted ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : isCurrent ? (
                <Clock className="w-3.5 h-3.5 text-white animate-pulse" />
              ) : (
                <span>{idx + 1}</span>
              )}
            </div>

            {/* Step Card Content */}
            <div>
              <div className="flex items-center gap-2">
                <h4 className={`text-sm font-semibold ${
                  isCurrent ? 'text-slate-900' : isCompleted ? 'text-slate-800' : 'text-slate-500'
                }`}>
                  {step.title}
                </h4>
                {isCurrent && (
                  <span className="cleo-badge bg-amber-50 text-amber-800 border-amber-200">Current Phase</span>
                )}
              </div>
              
              {step.description && (
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.description}</p>
              )}
              
              {step.date && (
                <span className="inline-block mt-1.5 text-[11px] font-mono text-slate-400">
                  {new Date(step.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
