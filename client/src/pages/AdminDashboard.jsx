import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { ShieldAlert, TrendingUp, Users, AlertTriangle, FileText, CheckCircle, Clock, HeartHandshake } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function AdminDashboard() {
  const [data, setData] = useState({
    overview: null,
    biasFlags: null,
    duplicates: null,
    rejections: null,
    timeline: null,
    categoryDistribution: null,
    grievanceStats: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [overviewRes, biasRes, duplicatesRes, rejectionsRes, timelineRes, catDistRes, grievanceRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/bias-flags'),
        api.get('/analytics/duplicates'),
        api.get('/analytics/rejections'),
        api.get('/analytics/timeline'),
        api.get('/analytics/category-distribution'),
        api.get('/analytics/grievance-stats')
      ]);

      setData({
        overview: overviewRes.data,
        biasFlags: biasRes.data,
        duplicates: duplicatesRes.data,
        rejections: rejectionsRes.data,
        timeline: timelineRes.data.timeline,
        categoryDistribution: catDistRes.data.distribution,
        grievanceStats: grievanceRes.data
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

  if (loading || !data.overview) return <div className="p-8 text-center text-surface-500">Loading Analytics Infrastructure...</div>;

  const { overview, biasFlags, duplicates, rejections, timeline, categoryDistribution, grievanceStats } = data;

  const COLORS = ['#1a3a5c', '#138808', '#f37021', '#dc2626', '#7c3aed'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-800 mb-2">Ministry Analytics Dashboard</h1>
          <p className="text-surface-500">Monitoring infrastructure to detect systemic bias, duplicate claims, and invalid rejections.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KPICard title="Total Applications" value={overview.totalApplications} icon={FileText} />
        <KPICard title="Approval Rate" value={`${overview.approvalRate}%`} icon={TrendingUp} color="text-success-500" />
        <KPICard title="Grievance Resolution" value={`${grievanceStats.resolutionRate}%`} icon={CheckCircle} color="text-success-500" />
        <KPICard title="Invalid Rejections" value={overview.invalidRejections} icon={ShieldAlert} color="text-danger-500" />
        <KPICard title="Assisted Profiles" value={overview.assistedProfiles} icon={HeartHandshake} color="text-accent-500" />
      </div>

      {/* Systemic Bias Flags */}
      <div className="glass-card p-6 mb-8 border-l-4 border-l-danger-500">
        <h3 className="text-lg font-bold text-surface-800 flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-danger-500" />
          Systemic Bias Detection Alerts
        </h3>
        {biasFlags.biasFlags.length === 0 ? (
          <p className="text-surface-500 text-sm">No systemic bias patterns detected currently.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {biasFlags.biasFlags.map((flag, idx) => (
              <div key={idx} className="bg-danger-50 border border-danger-100 rounded-lg p-4">
                <p className="font-bold text-danger-600 mb-2">{flag.category} Category</p>
                <p className="text-sm text-surface-600 mb-3">{flag.flagMessage}</p>
                <div className="flex gap-4 text-xs">
                  <span className="text-surface-500">Rejection Rate: <span className="text-danger-500 font-bold">{flag.rejectionRate}%</span></span>
                  <span className="text-surface-500">General Category Rate: <span className="text-surface-700">{flag.generalRejectionRate}%</span></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Application Volume Over Time */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-surface-800 mb-6">Application Volume Over Time</h3>
          <div className="h-64">
            {timeline && timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a3a5c" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#1a3a5c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#9aa5b4" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9aa5b4" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e5e9', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                    itemStyle={{ color: '#1e293b' }}
                  />
                  <Area type="monotone" dataKey="applications" stroke="#1a3a5c" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-surface-400">Not enough data to display timeline</div>
            )}
          </div>
        </div>

        {/* Category Distribution (Pie) */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-surface-800 mb-6">User Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e5e9', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  itemStyle={{ color: '#1e293b' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Rejection Reasons Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-surface-800 mb-6">Rejection Reasons by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rejections.byCategory.slice(0, 5)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" stroke="#9aa5b4" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="_id.rejectionCategory" type="category" width={100} tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e5e9', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  itemStyle={{ color: '#1e293b' }}
                  cursor={{fill: 'rgba(26, 58, 92, 0.05)'}}
                />
                <Bar dataKey="count" fill="#1a3a5c" radius={[0, 4, 4, 0]}>
                  {rejections.byCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.invalidCount > 0 ? '#dc2626' : '#1a3a5c'} />
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
          <h3 className="text-lg font-bold text-surface-800 mb-4 flex justify-between items-center">
            Recent Invalid Rejections
            <span className="bg-danger-50 text-danger-500 text-xs px-2 py-1 rounded border border-danger-100">{rejections.flagged.length} Flagged</span>
          </h3>
          <div className="overflow-y-auto pr-2 space-y-3 flex-grow">
            {rejections.flagged.length === 0 ? (
              <p className="text-surface-500 text-sm">No invalid rejections found.</p>
            ) : (
              rejections.flagged.map((app, idx) => (
                <div key={idx} className="bg-surface-50 border border-surface-200 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-surface-800">{app.schemeId?.name}</span>
                    <span className="text-xs bg-surface-100 px-2 py-0.5 rounded text-surface-500 border border-surface-200">{app.userId?.category}</span>
                  </div>
                  <p className="text-xs text-surface-500 mb-1">Stated Reason: <span className="text-surface-700">"{app.rejectionReason}"</span></p>
                  <p className="text-xs text-danger-500 font-medium">Flag: {app.rejectionFlagReason}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

function KPICard({ title, value, icon: Icon, color = "text-primary-600", trend }) {
  return (
    <div className="glass-card p-5">
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs font-medium text-surface-500">{title}</p>
        <div className={`p-2 rounded-lg bg-surface-50 border border-surface-200 ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <h3 className="text-2xl font-black text-surface-800">{value}</h3>
    </div>
  );
}
