import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { User as UserIcon, FileText, CheckCircle, ShieldCheck, ArrowRight, Clock, PlusCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my-applications');
      const appList = Array.isArray(res.data) ? res.data : (res.data?.applications || []);
      setApplications(appList);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  const category = user?.category || user?.demographics?.category || 'General';
  const gender = user?.gender || user?.demographics?.gender || 'N/A';
  const income = user?.annualIncome ?? user?.financials?.annualIncome ?? 0;
  const sector = user?.sector || user?.businessDetails?.sector || 'N/A';

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Profile Overview Header */}
      <div className="cleo-card p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">{user?.name}</h1>
              <span className="cleo-badge bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Applicant
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Category: {category} • Gender: {gender}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/match')}
            className="cleo-btn cleo-btn-accent text-xs font-semibold px-4 py-2.5"
          >
            <PlusCircle className="w-4 h-4" />
            Check Scheme Eligibility
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Applications Table */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Your Active Applications</h2>
            <span className="text-xs text-slate-500 font-mono">{applications.length} Total</span>
          </div>

          {loading ? (
            <div className="cleo-card p-8 text-center text-xs text-slate-500">Loading your applications...</div>
          ) : applications.length === 0 ? (
            <div className="cleo-card p-8 text-center space-y-3">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-600">No active welfare applications found.</p>
              <button
                onClick={() => navigate('/match')}
                className="cleo-btn cleo-btn-primary text-xs"
              >
                Run Scheme Matching Engine
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app._id} className="cleo-card cleo-card-hover p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {app.applicationNumber || `HEX-${app._id.toString().slice(-6).toUpperCase()}`}
                      </span>
                      <StatusBadge status={app.status} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{app.schemeId?.name || 'Welfare Scheme'}</h3>
                    <p className="text-xs text-slate-500">Submitted: {new Date(app.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <Link
                    to={`/applications/${app._id}`}
                    className="cleo-btn cleo-btn-secondary text-xs shrink-0 self-start sm:self-center"
                  >
                    <span>View Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Rights Summary & Demographics */}
        <div className="space-y-6">
          <div className="cleo-card p-5 space-y-3 bg-amber-50/50 border-amber-200">
            <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Statutory Guarantee</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Under statutory guidelines, your application cannot be rejected without a written explanation citing exact non-compliance reasons within 14 working days.
            </p>
          </div>

          <div className="cleo-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Demographic Credentials</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Category</span>
                <span className="font-semibold text-slate-900">{category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Annual Income</span>
                <span className="font-semibold text-slate-900">₹{Number(income).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Business Sector</span>
                <span className="font-semibold text-slate-900">{sector}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
