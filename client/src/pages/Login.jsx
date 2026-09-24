import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scale, Lock, User as UserIcon, Mail, ShieldCheck, UserCircle, Briefcase, Shield, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const navigateByRole = (role) => {
    if (role === 'admin') navigate('/admin');
    else if (role === 'ngo_worker') navigate('/assisted');
    else navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      navigateByRole(user.role);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPass, roleKey) => {
    setError('');
    setDemoLoading(roleKey);

    try {
      const user = await login(demoEmail, demoPass);
      navigateByRole(user.role);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Demo login failed. Is the server running?');
    } finally {
      setDemoLoading(null);
    }
  };

  const demoAccounts = [
    {
      key: 'applicant',
      label: 'Applicant',
      subtitle: 'SC Entrepreneur',
      email: 'applicant@example.com',
      password: 'password123',
      icon: UserCircle,
      color: 'emerald',
      description: 'Browse eligible schemes, apply, track applications',
    },
    {
      key: 'ngo',
      label: 'Field Worker',
      subtitle: 'NGO / VLE Partner',
      email: 'ngo@example.com',
      password: 'password123',
      icon: Briefcase,
      color: 'amber',
      description: 'Assist rural applicants via kiosk mode',
    },
    {
      key: 'admin',
      label: 'Admin',
      subtitle: 'Government Officer',
      email: 'admin@example.com',
      password: 'password123',
      icon: Shield,
      color: 'blue',
      description: 'Review applications, manage grievances',
    },
  ];

  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      hoverBorder: 'hover:border-emerald-400',
      icon: 'text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-700',
      ring: 'focus-visible:ring-emerald-400',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      hoverBorder: 'hover:border-amber-400',
      icon: 'text-amber-600',
      badge: 'bg-amber-100 text-amber-700',
      ring: 'focus-visible:ring-amber-400',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      hoverBorder: 'hover:border-blue-400',
      icon: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-700',
      ring: 'focus-visible:ring-blue-400',
    },
  };

  return (
    <div className="min-h-[85vh] cleo-grid-bg flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">

        {/* ─── Brand Header ─── */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 items-center justify-center text-amber-400 shadow-lg shadow-slate-900/20">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">NyaySetu Portal</h2>
            <p className="text-xs text-slate-500 mt-0.5">Unified Welfare Access • Rights-Aware Platform</p>
          </div>
        </div>

        {/* ─── Login Form Card ─── */}
        <div className="cleo-card p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg flex items-start gap-2">
              <span className="mt-0.5 shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address / Aadhaar User ID</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.gov.in"
                  className="cleo-input !pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="cleo-input !pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || demoLoading}
              className="cleo-btn cleo-btn-primary w-full py-2.5 text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </span>
              ) : (
                'Sign In To Portal'
              )}
            </button>
          </form>

          {/* ─── Quick Demo Access ─── */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center gap-2 justify-center">
              <div className="h-px flex-1 bg-slate-200" />
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">Quick Demo Access</p>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {demoAccounts.map((acc) => {
                const colors = colorMap[acc.color];
                const Icon = acc.icon;
                const isThisLoading = demoLoading === acc.key;
                const isDisabled = loading || (demoLoading && demoLoading !== acc.key);

                return (
                  <button
                    key={acc.key}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleQuickLogin(acc.email, acc.password, acc.key)}
                    className={`
                      group relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-200
                      ${colors.bg} ${colors.border} ${colors.hoverBorder}
                      hover:shadow-sm active:scale-[0.99]
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
                    `}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors.badge} shrink-0`}>
                      {isThisLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-800">{acc.label}</p>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${colors.badge}`}>{acc.subtitle}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">{acc.description}</p>
                    </div>
                    <div className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-slate-400 text-center leading-tight mt-2">
              Demo accounts are pre-seeded. Click any role above to instantly log in.
            </p>
          </div>
        </div>

        {/* ─── Security Footer ─── */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3 h-3" />
          <span>Secured by JWT Authentication • End-to-End Encrypted</span>
        </div>
      </div>
    </div>
  );
}
