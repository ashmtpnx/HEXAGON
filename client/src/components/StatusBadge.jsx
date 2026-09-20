import React from 'react';

export default function StatusBadge({ status }) {
  const statusConfig = {
    draft: { color: 'bg-slate-100 text-slate-700 border-slate-300', label: 'Draft' },
    submitted: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Submitted' },
    under_review: { color: 'bg-amber-50 text-amber-800 border-amber-200', label: 'Under Review' },
    documents_requested: { color: 'bg-orange-50 text-orange-800 border-orange-200', label: 'Docs Requested' },
    approved: { color: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'Approved' },
    disbursed: { color: 'bg-teal-50 text-teal-800 border-teal-200', label: 'Disbursed' },
    rejected: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Rejected' },
    appealed: { color: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Appealed' }
  };

  const config = statusConfig[status] || { color: 'bg-slate-100 text-slate-700 border-slate-200', label: status || 'Unknown' };

  return (
    <span className={`cleo-badge ${config.color}`}>
      {config.label}
    </span>
  );
}
