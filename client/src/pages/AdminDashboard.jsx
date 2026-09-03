import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShieldAlert, TrendingUp, Users, AlertTriangle, FileText, CheckCircle, Clock } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function AdminDashboard() {
  const [data, setData] = useState({
    overview: null,
    biasFlags: null,
    duplicates: null,
    rejections: null
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [overviewRes, biasRes, duplicatesRes, rejectionsRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/bias-flags'),
        api.get('/analytics/duplicates'),
        api.get('/analytics/rejections')
      ]);

      setData({
        overview: overviewRes.data,
        biasFlags: biasRes.data,
        duplicates: duplicatesRes.data,
        rejections: rejectionsRes.data
      });
    } catch (error) {
      console.error('Failed to load admin analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !data.overview) return <div className="p-8 text-center text-surface-400">Loading Analytics Infrastructure...</div>;

  const { overview, biasFlags, duplicates, rejections } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Ministry Analytics Dashboard</h1>
        <p className="text-surface-400">Monitoring infrastructure to detect systemic bias, duplicate claims, and invalid rejections.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Total Applications" value={overview.totalApplications} icon={FileText} />
        <KPICard title="Approval Rate" value={`${overview.approvalRate}%`} icon={TrendingUp} trend="up" />
        <KPICard title="Invalid Rejections Flagged" value={overview.invalidRejections} icon={ShieldAlert} color="text-warning-500" />
        <KPICard title="Duplicate Claims Blocked" value={overview.duplicatesCaught} icon={CheckCircle} color="text-success-500" />
      </div>

      {/* Systemic Bias Flags */}
      <div className="glass-card p-6 mb-8 border-l-4 border-l-danger-500">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-danger-500" />
          Systemic Bias Detection Alerts
        </h3>
        {biasFlags.biasFlags.length === 0 ? (
          <p className="text-surface-400 text-sm">No systemic bias patterns detected currently.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {biasFlags.biasFlags.map((flag, idx) => (
              <div key={idx} className="bg-danger-500/10 border border-danger-500/30 rounded-lg p-4">
                <p className="font-bold text-danger-400 mb-2">{flag.category} Category</p>
                <p className="text-sm text-surface-200 mb-3">{flag.flagMessage}</p>
                <div className="flex gap-4 text-xs">
                  <span className="text-surface-400">Rejection Rate: <span className="text-danger-400 font-bold">{flag.rejectionRate}%</span></span>
                  <span className="text-surface-400">General Category Rate: <span className="text-surface-200">{flag.generalRejectionRate}%</span></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Rejection Reasons Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-6">Rejection Reasons by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rejections.byCategory.slice(0, 5)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis dataKey="_id.rejectionCategory" type="category" width={100} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]}>
                  {rejections.byCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.invalidCount > 0 ? '#f43f5e' : '#4f46e5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-surface-400 mt-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-danger-500 inline-block"></span> Red indicates categories containing flagged/invalid rejections.
          </p>
        </div>

        {/* Invalid Rejections Log */}
        <div className="glass-card p-6 flex flex-col h-[350px]">
          <h3 className="text-lg font-bold text-white mb-4 flex justify-between items-center">
            Recent Invalid Rejections
            <span className="bg-danger-500/20 text-danger-400 text-xs px-2 py-1 rounded-full">{rejections.flagged.length} Flagged</span>
          </h3>
          <div className="overflow-y-auto pr-2 space-y-3 flex-grow">
            {rejections.flagged.length === 0 ? (
              <p className="text-surface-400 text-sm">No invalid rejections found.</p>
            ) : (
              rejections.flagged.map((app, idx) => (
                <div key={idx} className="bg-surface-800/50 border border-surface-700 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-surface-100">{app.schemeId?.name}</span>
                    <span className="text-xs bg-surface-700 px-2 py-0.5 rounded text-surface-300">{app.userId?.category}</span>
                  </div>
                  <p className="text-xs text-surface-400 mb-1">Stated Reason: <span className="text-surface-200">"{app.rejectionReason}"</span></p>
                  <p className="text-xs text-danger-400 font-medium">Flag: {app.rejectionFlagReason}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

function KPICard({ title, value, icon: Icon, color = "text-primary-400", trend }) {
  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-surface-400 mb-1">{title}</p>
          <h3 className="text-3xl font-black text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-surface-800 border border-surface-700 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
