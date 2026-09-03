import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { Search, FileText, ChevronRight, AlertCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/applications/my');
        setApplications(res.data.applications);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  const rejectedCount = applications.filter(a => a.status === 'rejected').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user.name}</h1>
          <p className="text-surface-400">Manage your applications and find eligible schemes.</p>
        </div>
        <button onClick={() => navigate('/match')} className="btn-primary flex items-center gap-2">
          <Search className="w-4 h-4" />
          Find Matching Schemes
        </button>
      </div>

      {rejectedCount > 0 && (
        <div className="mb-8 p-4 rights-alert flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-warning-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-warning-500 mb-1">Attention Required</h3>
            <p className="text-sm text-surface-200">You have {rejectedCount} rejected application(s). Please review them as they may be eligible for escalation if the rejection reason is invalid under scheme guidelines.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Summary */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-primary-400" />
              Profile Details
            </h2>
            <div className="space-y-4">
              <ProfileItem label="Category" value={user.category} />
              <ProfileItem label="Gender" value={user.gender} />
              <ProfileItem label="Business Stage" value={user.businessStage} className="capitalize" />
              <ProfileItem label="Sector" value={user.sector} className="capitalize" />
              <ProfileItem label="Annual Income" value={`₹${user.annualIncome?.toLocaleString('en-IN')}`} />
              <ProfileItem label="Location" value={`${user.location?.district || 'Unknown'} (${user.location?.isRural ? 'Rural' : 'Urban'})`} />
              
              {user.isAssistedProfile && (
                <div className="mt-4 p-3 bg-surface-800 rounded-lg border border-surface-700 text-xs text-surface-300">
                  This profile was created via VLE Assisted Mode.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="lg:col-span-2">
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-surface-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-400" />
                My Applications
              </h2>
              <span className="bg-surface-800 text-surface-300 py-1 px-3 rounded-full text-xs font-semibold">
                {applications.length} Total
              </span>
            </div>
            
            {applications.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-surface-600 mx-auto mb-4 opacity-50" />
                <p className="text-surface-400 mb-4">You haven't applied for any schemes yet.</p>
                <button onClick={() => navigate('/match')} className="btn-outline">
                  Find Schemes
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-surface-700">
                {applications.map((app) => (
                  <li key={app._id} className="hover:bg-surface-800/50 transition-colors">
                    <Link to={`/application/${app._id}`} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-white mb-1">{app.schemeId?.name || 'Unknown Scheme'}</h3>
                        <p className="text-sm text-surface-400 mb-2">{app.schemeId?.ministry}</p>
                        <div className="flex items-center gap-4 text-xs text-surface-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Updated {new Date(app.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                        <StatusBadge status={app.status} />
                        <ChevronRight className="w-5 h-5 text-surface-500" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ label, value, className = '' }) {
  return (
    <div className="flex justify-between items-center border-b border-surface-700/50 pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-surface-400">{label}</span>
      <span className={`text-sm font-medium text-white ${className}`}>{value || 'N/A'}</span>
    </div>
  );
}

import { User as UserIcon } from 'lucide-react';
