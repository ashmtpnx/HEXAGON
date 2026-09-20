import React from 'react';

export default function StatusBadge({ status }) {
  const statusConfig = {
    draft: { color: 'bg-surface-100 text-surface-500 border-surface-200', label: 'Draft' },
    submitted: { color: 'bg-primary-50 text-primary-600 border-primary-200', label: 'Submitted' },
    under_review: { color: 'bg-warning-50 text-warning-600 border-warning-100', label: 'Under Review' },
    approved: { color: 'bg-success-100 text-success-500 border-success-100', label: 'Approved' },
    rejected: { color: 'bg-danger-50 text-danger-500 border-danger-100', label: 'Rejected' },
    escalated: { color: 'bg-accent-50 text-accent-600 border-accent-200', label: 'Escalated' },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold border ${config.color}`}>
      {config.label}
    </span>
  );
}
