import React from 'react';
import { CheckCircle, Circle, AlertCircle, Clock } from 'lucide-react';

export default function Timeline({ steps, currentStep }) {
  return (
    <div className="relative border-l border-surface-700 ml-3 md:ml-4 space-y-6 py-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isFuture = index > currentStep;
        
        let Icon = Circle;
        let iconColor = 'text-surface-600 bg-surface-900';
        let borderColor = 'border-surface-600';
        
        if (isCompleted) {
          Icon = CheckCircle;
          iconColor = 'text-success-500 bg-surface-900';
          borderColor = 'border-success-500';
        } else if (isCurrent) {
          Icon = Clock;
          iconColor = 'text-primary-400 bg-surface-900';
          borderColor = 'border-primary-400';
        }

        return (
          <div key={index} className="relative pl-6">
            <span className={`absolute -left-3 top-1 rounded-full bg-surface-900 border ${borderColor}`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </span>
            <div className={`flex flex-col ${isFuture ? 'opacity-60' : ''}`}>
              <span className={`text-sm font-bold ${isCurrent ? 'text-primary-300' : isCompleted ? 'text-surface-100' : 'text-surface-400'}`}>
                {step.title}
              </span>
              {step.description && (
                <span className="text-xs text-surface-400 mt-1">{step.description}</span>
              )}
              {step.estimatedDays && (
                <span className="text-xs text-surface-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Est. {step.estimatedDays} days
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
