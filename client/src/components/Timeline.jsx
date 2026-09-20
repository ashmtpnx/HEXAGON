import React from 'react';
import { CheckCircle, Circle, AlertCircle, Clock } from 'lucide-react';

export default function Timeline({ steps, currentStep }) {
  return (
    <div className="relative border-l-2 border-surface-200 ml-3 md:ml-4 space-y-6 py-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isFuture = index > currentStep;
        
        let Icon = Circle;
        let iconColor = 'text-surface-300';
        let dotBg = 'bg-white border-2 border-surface-300';
        
        if (isCompleted) {
          Icon = CheckCircle;
          iconColor = 'text-success-500';
          dotBg = 'bg-white';
        } else if (isCurrent) {
          Icon = Clock;
          iconColor = 'text-primary-600';
          dotBg = 'bg-white';
        }

        return (
          <div key={index} className="relative pl-6">
            <span className={`absolute -left-3 top-1 rounded-full ${dotBg}`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </span>
            <div className={`flex flex-col ${isFuture ? 'opacity-50' : ''}`}>
              <span className={`text-sm font-semibold ${isCurrent ? 'text-primary-600' : isCompleted ? 'text-surface-800' : 'text-surface-400'}`}>
                {step.title}
              </span>
              {step.description && (
                <span className="text-xs text-surface-500 mt-1">{step.description}</span>
              )}
              {step.estimatedDays && (
                <span className="text-xs text-surface-400 mt-1 flex items-center gap-1">
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
