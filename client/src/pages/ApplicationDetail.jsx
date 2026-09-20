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
      const appData = res.data?.application || res.data;
      setApplication(appData);
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
      const appData = res.data?.application || res.data;
      setApplication(appData);
      setCommentText('');
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="cleo-card p-8 text-center space-y-3">
          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-600 font-medium">Loading application record...</p>
        </div>
      </div>
    );
  }

  if (!application || !application._id) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="cleo-card p-8 text-center space-y-4 max-w-md">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <p className="text-xs text-slate-700">Application record not found or inaccessible.</p>
          <button onClick={() => navigate('/dashboard')} className="cleo-btn cleo-btn-primary text-xs">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const appNumber = application.applicationNumber || `HEX-${application._id.toString().slice(-6).toUpperCase()}`;
  const schemeName = application.schemeId?.name || 'Government Welfare Scheme';
  const applicantName = application.userId?.name || user?.name || 'Applicant';
  const applicantEmail = application.userId?.email || user?.email || 'N/A';
  const appStatus = application.status || 'submitted';

  const timelineSteps = [
    { title: 'Application Submitted', description: 'Matched and logged into central verifier queue', date: application.createdAt || new Date() },
    { title: 'Document Audit', description: 'District officer verification of category credentials', date: application.updatedAt || new Date() },
    { title: 'Statutory Verification', description: 'Deemed approval window active (14 Days SLA)' },
    { title: 'Final Disbursement', description: 'Benefit or capital subsidy credit' }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'draft': return 0;
      case 'submitted': return 1;
      case 'under_review': return 2;
      case 'approved': return 3;
      case 'disbursed': return 4;
      default: return 1;
    }
  };

  const auditHistory = application.statusHistory || [];

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
              <span className="text-xs font-mono font-bold text-slate-900">{appNumber}</span>
              <StatusBadge status={appStatus} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">{schemeName}</h1>
            <p className="text-xs text-slate-500 mt-1">Applicant: <span className="font-semibold text-slate-800">{applicantName}</span> ({applicantEmail})</p>
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
            <Timeline steps={timelineSteps} currentStep={getStepIndex(appStatus)} />
          </div>

          {/* Officer Verification Actions (If Officer/Admin) */}
          {(user?.role === 'admin' || user?.role === 'ngo_worker' || user?.role === 'vle') && (
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
            {auditHistory.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {auditHistory.map((h, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 capitalize">{h.status?.replace('_', ' ')}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{h.timestamp ? new Date(h.timestamp).toLocaleDateString('en-IN') : ''}</span>
                    </div>
                    {h.reason && <p className="text-[11px] text-slate-600">{h.reason}</p>}
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
