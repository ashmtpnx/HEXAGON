import React from 'react';

export default function StatusBadge({ status }) {
  const statusConfig = {
    draft: { color: 'bg-surface-800 text-surface-300 border-surface-600', label: 'Draft' },
    submitted: { color: 'bg-primary-900/50 text-primary-300 border-primary-500/30', label: 'Submitted', pulse: true },
    under_review: { color: 'bg-warning-500/20 text-warning-400 border-warning-500/30', label: 'Under Review', pulse: true },
    approved: { color: 'bg-success-500/20 text-success-400 border-success-500/30', label: 'Approved' },
    rejected: { color: 'bg-danger-500/20 text-danger-400 border-danger-500/30', label: 'Rejected' },
    escalated: { color: 'bg-accent-500/20 text-accent-400 border-accent-500/30', label: 'Escalated', pulse: true },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.pulse && <span className="pulse-dot bg-current" />}
      {config.label}
    </span>
  );
}
