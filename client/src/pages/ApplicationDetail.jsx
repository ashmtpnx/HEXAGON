import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Timeline from '../components/Timeline';
import { ShieldAlert, CheckCircle, Clock, FileText, Send, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/applications/${id}`);
      setApplication(res.data);
    } catch (err) {
      console.error('Failed to fetch application detail', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await api.put(`/applications/${id}/status`, {
        status: newStatus,
        comment: commentText || `Status updated to ${newStatus}`
      });
      setApplication(res.data);
      setCommentText('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading application detail...</div>;
  }

  if (!application) {
    return <div className="p-12 text-center text-xs text-slate-500">Application not found.</div>;
  }

  const timelineSteps = [
    { title: 'Application Submitted', description: 'Matched and logged into central verifier queue', date: application.createdAt },
    { title: 'Document Audit', description: 'District officer verification of category credentials', date: application.updatedAt },
    { title: 'Statutory Verification', description: 'Deemed approval window active (14 Days SLA)' },
    { title: 'Final Disbursement', description: 'Benefit or capital subsidy credit' }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'submitted': return 1;
      case 'under_review': return 2;
      case 'approved': return 3;
      case 'disbursed': return 4;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Top Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="cleo-btn cleo-btn-secondary text-xs"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Portal</span>
      </button>

      {/* Header Info */}
      <div className="cleo-card p-6 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-slate-900">{application.applicationNumber}</span>
              <StatusBadge status={application.status} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">{application.schemeId?.name}</h1>
            <p className="text-xs text-slate-500 mt-1">Applicant: <span className="font-semibold text-slate-800">{application.userId?.name}</span> ({application.userId?.email})</p>
          </div>
        </div>

        {/* Dynamic Statutory Callout */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Statutory Binding SLA & Rejection Guarantee
          </p>
          <p className="text-[11px] leading-relaxed">
            The verifier must either approve or issue an official defect notice by <strong>14 working days</strong>. Failure to act results in deemed administrative sanction.
          </p>
        </div>
      </div>

      {/* Split Details Layout */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timeline & Documents */}
        <div className="md:col-span-2 space-y-6">
          <div className="cleo-card p-6 space-y-4 bg-white">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Verification Progress Timeline</h2>
            <Timeline steps={timelineSteps} currentStep={getStepIndex(application.status)} />
          </div>

          {/* Officer Verification Actions (If Officer/Admin) */}
          {(user?.role === 'admin' || user?.role === 'ngo_worker') && (
            <div className="cleo-card p-6 space-y-4 bg-slate-900 text-white">
              <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Officer Administrative Action</h2>
              
              <div className="space-y-3">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Enter verification notes or audit comments..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-md p-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                />
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdateStatus('under_review')}
                    disabled={updating}
                    className="cleo-btn bg-amber-600 text-white border-amber-600 hover:bg-amber-700 text-xs py-1.5"
                  >
                    Mark Under Review
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('approved')}
                    disabled={updating}
                    className="cleo-btn bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800 text-xs py-1.5"
                  >
                    Approve Application
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('rejected')}
                    disabled={updating}
                    className="cleo-btn bg-red-700 text-white border-red-700 hover:bg-red-800 text-xs py-1.5"
                  >
                    Reject Application
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Audit Comments & Metadata */}
        <div className="space-y-6">
          <div className="cleo-card p-5 space-y-3 bg-white">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Application Audit Trail</h2>
            {application.comments && application.comments.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {application.comments.map((c, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                    <p className="text-slate-800 font-medium">{c.comment}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{new Date(c.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No officer audit notes logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
