import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import StatusBadge from '../components/StatusBadge';
import { Activity, Users, FileText, CheckCircle, Clock, ShieldAlert, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, appsRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/applications/all')
      ]);
      setStats(statsRes.data);
      setApplications(appsRes.data);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = stats?.statusBreakdown?.map(item => ({
    name: item._id?.replace('_', ' ')?.toUpperCase() || 'UNKNOWN',
    count: item.count
  })) || [];

  const COLORS = ['#0f172a', '#d97706', '#059669', '#dc2626', '#2563eb'];

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin & District Oversight Panel</h1>
          <p className="text-xs text-slate-500">Real-Time Application Verifications & Statutory SLA Tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="cleo-badge bg-slate-900 text-white border-slate-900">Live Telemetry</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="cleo-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Applications</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">{stats?.totalApplications || 0}</p>
        </div>

        <div className="cleo-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Approved Applications</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 font-mono">{stats?.approvedApplications || 0}</p>
        </div>

        <div className="cleo-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-700 font-mono">{stats?.pendingApplications || 0}</p>
        </div>

        <div className="cleo-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Approval Rate</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">{stats?.approvalRate || '0'}%</p>
        </div>
      </div>

      {/* Chart & Queue Section */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Chart */}
        <div className="md:col-span-2 cleo-card p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Application Distribution by Status</h2>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Admin Action Summary */}
        <div className="cleo-card p-6 space-y-4 bg-white">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Statutory SLA Monitor</h2>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                14-Day Binding Verification Rule
              </p>
              <p className="text-[11px] leading-relaxed">
                Applications exceeding 14 days without verifier action trigger automatic deemed approval status.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Active Verifiers</span>
                <span className="font-bold text-slate-900">12 Officers</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Avg SLA Processing</span>
                <span className="font-bold text-slate-900">4.2 Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Queue Table */}
      <div className="cleo-card overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Verification Queue</h2>
          <span className="text-xs text-slate-500 font-mono">{applications.length} Records</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading queue...</div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No applications pending verification.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">App ID</th>
                  <th className="p-4">Applicant</th>
                  <th className="p-4">Scheme</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900">{app.applicationNumber}</td>
                    <td className="p-4 text-slate-800 font-medium">{app.userId?.name || 'N/A'}</td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">{app.schemeId?.name || 'N/A'}</td>
                    <td className="p-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="p-4 font-mono text-slate-500">{new Date(app.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/applications/${app._id}`}
                        className="cleo-btn cleo-btn-secondary text-xs px-2.5 py-1"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
