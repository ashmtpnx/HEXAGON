import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import Timeline from '../components/Timeline';
import { FileText, ShieldAlert, AlertTriangle, Send, Upload, Info, MessageSquare } from 'lucide-react';

export default function ApplicationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grievanceText, setGrievanceText] = useState('');
  const [escalating, setEscalating] = useState(false);

  const fetchApp = async () => {
    try {
      const res = await api.get(`/applications/${id}`);
      setApp(res.data.application);
    } catch (err) {
      console.error(err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApp();
  }, [id]);

  const handleSubmit = async () => {
    try {
      await api.patch(`/applications/${id}/submit`);
      fetchApp();
    } catch (err) {
      alert('Failed to submit application.');
    }
  };

  const handleDocumentToggle = async (docName, currentStatus) => {
    try {
      await api.patch(`/applications/${id}/documents`, {
        docName,
        isUploaded: !currentStatus
      });
      fetchApp();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEscalate = async () => {
    if (!window.confirm('Are you sure you want to escalate this rejection to the next authority level?')) return;
    setEscalating(true);
    try {
      const res = await api.post(`/applications/${id}/escalate`);
      alert(res.data.escalationMessage);
      fetchApp();
    } catch (err) {
      alert('Failed to escalate.');
    } finally {
      setEscalating(false);
    }
  };

  const handleSendGrievance = async (e) => {
    e.preventDefault();
    if (!grievanceText.trim()) return;
    
    try {
      await api.post(`/applications/${id}/grievance`, { message: grievanceText });
      setGrievanceText('');
      fetchApp();
    } catch (err) {
      alert('Failed to send message.');
    }
  };

  if (loading || !app) return <div className="p-8 text-center">Loading application...</div>;

  const scheme = app.schemeId;
  const uploadedCount = app.documentChecklist.filter(d => d.isUploaded).length;
  const isDraft = app.status === 'draft';
  const isRejected = app.status === 'rejected';
  
  // Calculate current timeline step based on status history
  let currentStep = 0;
  if (app.status === 'submitted') currentStep = 1;
  if (app.status === 'under_review') currentStep = 2;
  if (app.status === 'approved') currentStep = scheme.processSteps.length;
  if (isRejected || app.status === 'escalated') currentStep = -1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">{scheme.name}</h1>
            <StatusBadge status={app.status} />
          </div>
          <p className="text-surface-400 text-sm">Application ID: {app._id.slice(-8).toUpperCase()}</p>
        </div>
        
        {isDraft && (
          <button 
            onClick={handleSubmit} 
            disabled={uploadedCount < app.documentChecklist.length}
            className={`btn-primary ${uploadedCount < app.documentChecklist.length ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Submit Application
          </button>
        )}
      </div>

      {/* INVALID REJECTION ALERT (Core differentiator) */}
      {isRejected && !app.isRejectionValid && (
        <div className="rejection-alert p-5 mb-8 animate-fade-in-up">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-danger-500 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-danger-400 text-lg mb-2">Platform Alert: Invalid Rejection Reason Detected</h3>
              <p className="text-surface-200 text-sm mb-2">
                The stated rejection reason was: <strong className="text-white">"{app.rejectionReason}"</strong>
              </p>
              <p className="text-surface-300 text-sm mb-4">
                <span className="text-danger-400 font-semibold border-b border-danger-500 border-dashed">Why this is flagged:</span> {app.rejectionFlagReason}
              </p>
              
              {!app.escalationRequested ? (
                <button 
                  onClick={handleEscalate}
                  disabled={escalating}
                  className="btn-danger py-2"
                >
                  {escalating ? 'Escalating...' : 'One-Tap Escalate to Higher Authority'}
                </button>
              ) : (
                <div className="text-accent-400 font-semibold text-sm">
                  ✓ Escalation initiated. Currently under review by: {app.escalationHistory[app.escalationHistory.length-1]?.authority}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Valid Rejection View */}
      {isRejected && app.isRejectionValid && (
        <div className="bg-surface-800/80 border border-surface-700 p-5 rounded-xl mb-8">
          <h3 className="font-bold text-white mb-2 text-lg">Application Rejected</h3>
          <p className="text-surface-300 text-sm mb-1">Reason provided by evaluating authority:</p>
          <div className="bg-surface-900 p-3 rounded text-surface-200 border border-surface-700 font-mono text-sm">
            {app.rejectionReason}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Rights Awareness */}
          <div className="glass-card p-6 border-l-4 border-l-warning-500">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-warning-500" />
              Your Legal Rights for this Scheme
            </h3>
            <ul className="space-y-4">
              {scheme.applicantRights?.map((right, i) => (
                <li key={i} className="bg-surface-900/50 p-4 rounded-lg border border-surface-700">
                  <p className="font-semibold text-surface-100 text-sm mb-1">{right.right}</p>
                  <p className="text-xs text-surface-400">{right.explanation}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Document Checklist */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-end mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-400" />
                Document Checklist
              </h3>
              <span className="text-xs text-surface-400">{uploadedCount} of {app.documentChecklist.length} uploaded</span>
            </div>
            
            <div className="mb-6">
              <ProgressBar current={uploadedCount} total={app.documentChecklist.length} />
            </div>
            
            <ul className="space-y-3">
              {app.documentChecklist.map((doc, idx) => (
                <li key={idx} className="flex items-center justify-between p-3 rounded bg-surface-900/50 border border-surface-700/50 hover:bg-surface-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => isDraft && handleDocumentToggle(doc.docName, doc.isUploaded)}
                      disabled={!isDraft}
                      className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${doc.isUploaded ? 'bg-success-500 text-white' : 'bg-surface-700 text-transparent border border-surface-600'} ${!isDraft && 'cursor-default opacity-70'}`}
                    >
                      ✓
                    </button>
                    <div>
                      <p className="text-sm font-medium text-surface-200">{doc.docName}</p>
                      {doc.uploadedAt && <p className="text-[10px] text-surface-500">Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</p>}
                    </div>
                  </div>
                  {isDraft && !doc.isUploaded && (
                    <button onClick={() => handleDocumentToggle(doc.docName, doc.isUploaded)} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Simulate Upload
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          {/* Timeline */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-white mb-6">Process Status</h3>
            <Timeline steps={scheme.processSteps} currentStep={currentStep} />
          </div>

          {/* Grievance Thread */}
          <div className="glass-card flex flex-col h-[400px]">
            <div className="p-4 border-b border-surface-700 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-400" />
              <h3 className="font-bold text-white">Application Grievances</h3>
            </div>
            
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
              {app.grievanceThread.length === 0 ? (
                <div className="text-center text-surface-500 text-sm mt-10">
                  No messages yet. Use this thread to raise issues directly related to this application.
                </div>
              ) : (
                app.grievanceThread.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.role === 'admin' ? 'items-start' : 'items-end'}`}>
                    <div className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.role === 'admin' ? 'bg-surface-800 text-surface-200' : 'bg-primary-900/40 text-primary-100 border border-primary-500/30'}`}>
                      {msg.message}
                    </div>
                    <span className="text-[10px] text-surface-500 mt-1">
                      {msg.authorName} ({msg.role}) • {new Date(msg.timestamp).toLocaleString([], {hour: '2-digit', minute:'2-digit', month:'short', day:'numeric'})}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleSendGrievance} className="p-3 border-t border-surface-700 bg-surface-900/50 flex gap-2">
              <input 
                type="text" 
                value={grievanceText}
                onChange={(e) => setGrievanceText(e.target.value)}
                placeholder="Type your message..."
                className="input-field py-2 flex-grow text-sm"
              />
              <button type="submit" disabled={!grievanceText.trim()} className="bg-primary-600 hover:bg-primary-500 text-white rounded-lg px-3 py-2 transition-colors disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
