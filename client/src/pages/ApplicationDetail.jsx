import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Timeline from '../components/Timeline';
import ProgressBar from '../components/ProgressBar';
import { 
  ShieldAlert, CheckCircle, Clock, FileText, Send, AlertTriangle, ArrowLeft, 
  UploadCloud, CheckCircle2, FileCheck, Eye, Trash2, ShieldCheck, Lock
} from 'lucide-react';

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [updating, setUpdating] = useState(false);
  const [uploadingDocName, setUploadingDocName] = useState(null);

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

  const handleFileUpload = async (docName, file) => {
    if (!file) return;
    setUploadingDocName(docName);
    try {
      // Send document checklist update to backend
      const res = await api.patch(`/applications/${id}/documents`, {
        docName,
        isUploaded: true,
        fileName: file.name
      });
      const updatedApp = res.data?.application || res.data;
      setApplication(updatedApp);
    } catch (err) {
      alert(err.response?.data?.message || 'Document upload failed. Please try again.');
    } finally {
      setUploadingDocName(null);
    }
  };

  const handleRemoveDoc = async (docName) => {
    try {
      const res = await api.patch(`/applications/${id}/documents`, {
        docName,
        isUploaded: false
      });
      const updatedApp = res.data?.application || res.data;
      setApplication(updatedApp);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove document.');
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

  // Build document items list (from application.documentChecklist or scheme requiredDocs)
  const schemeRequiredDocs = application.schemeId?.requiredDocs || [
    { name: 'Aadhaar Card', description: 'For identity and DOB verification', isMandatory: true },
    { name: 'Caste / Category Certificate', description: 'Issued by District Magistrate or competent authority', isMandatory: true },
    { name: 'PAN Card / Tax Identification', description: 'For business tax compliance', isMandatory: true },
    { name: 'Business Project Report', description: 'Detailed viability and cost estimates plan', isMandatory: true },
    { name: 'Bank Passbook / Account Statement', description: 'Last 6 months account statement for direct benefit transfer', isMandatory: true }
  ];

  const docChecklist = schemeRequiredDocs.map(reqDoc => {
    const docName = typeof reqDoc === 'string' ? reqDoc : reqDoc.name;
    const desc = typeof reqDoc === 'string' ? 'Mandatory verification document' : reqDoc.description;
    const existing = (application.documentChecklist || []).find(d => d.docName === docName);
    return {
      docName,
      description: desc,
      isUploaded: existing ? existing.isUploaded : false,
      uploadedAt: existing ? existing.uploadedAt : null
    };
  });

  const uploadedCount = docChecklist.filter(d => d.isUploaded).length;
  const totalDocs = docChecklist.length;

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
        {/* Left 2 Cols: Timeline & Interactive Document Upload Checklist */}
        <div className="md:col-span-2 space-y-6">
          {/* ─── MANDATORY DOCUMENT CHECKLIST & UPLOAD MODULE ─── */}
          <div className="cleo-card p-6 space-y-5 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-slate-900" />
                  Mandatory Document Verification & Upload System
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Attach required credentials for district verification officer audit</p>
              </div>
              <span className="cleo-badge bg-slate-100 text-slate-800 border-slate-300 font-mono">
                {uploadedCount}/{totalDocs} Verified
              </span>
            </div>

            {/* Document Verification Progress */}
            <ProgressBar current={uploadedCount} total={totalDocs} label="Overall Document Compliance" />

            {/* Document Checklist Items */}
            <div className="space-y-3 pt-2">
              {docChecklist.map((doc, idx) => (
                <div key={idx} className={`p-4 border rounded-lg transition-all ${
                  doc.isUploaded ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {doc.isUploaded ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                        <h4 className="text-xs font-bold text-slate-900">{doc.docName}</h4>
                        {doc.isUploaded ? (
                          <span className="cleo-badge bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">Verified</span>
                        ) : (
                          <span className="cleo-badge bg-amber-100 text-amber-800 border-amber-200 text-[10px]">Upload Required</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{doc.description}</p>
                      {doc.uploadedAt && (
                        <p className="text-[10px] font-mono text-emerald-700">
                          Attached on: {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="shrink-0 flex items-center gap-2">
                      {doc.isUploaded ? (
                        <>
                          <button
                            type="button"
                            onClick={() => alert(`Viewing verified record for: ${doc.docName}`)}
                            className="cleo-btn cleo-btn-secondary text-xs px-2.5 py-1 text-slate-700"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveDoc(doc.docName)}
                            className="cleo-btn bg-red-50 text-red-700 border-red-200 hover:bg-red-100 text-xs px-2.5 py-1"
                            title="Remove document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <label className="cleo-btn cleo-btn-primary text-xs px-3.5 py-1.5 cursor-pointer inline-flex items-center gap-1.5">
                          <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                          <span>{uploadingDocName === doc.docName ? 'Uploading...' : 'Upload PDF / Image'}</span>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            className="hidden"
                            disabled={uploadingDocName === doc.docName}
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) handleFileUpload(doc.docName, file);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline View */}
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

        {/* Right Col: Audit Comments & Security Metadata */}
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
