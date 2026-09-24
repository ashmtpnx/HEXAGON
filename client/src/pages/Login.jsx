import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scale, Lock, User as UserIcon, Mail, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'ngo_worker') {
        navigate('/assisted');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[85vh] cleo-grid-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-slate-900 items-center justify-center text-amber-500 shadow-xs">
            <Scale className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Portal Authentication</h2>
          <p className="text-xs text-slate-500">Official Portal for Applicants, NGO Field Workers & Officers</p>
        </div>

        {/* Login Form Card */}
        <div className="cleo-card p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address / Aadhaar User ID</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.gov.in"
                  className="cleo-input pl-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="cleo-input pl-9"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cleo-btn cleo-btn-primary w-full py-2.5 text-xs font-semibold"
            >
              {loading ? 'Authenticating...' : 'Sign In To Portal'}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('applicant@example.com', 'password123')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-center transition-colors"
              >
                <p className="text-xs font-semibold text-slate-800">Applicant</p>
                <p className="text-[10px] text-slate-500">Entrepreneur</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('ngo@example.com', 'password123')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-center transition-colors"
              >
                <p className="text-xs font-semibold text-slate-800">Field Worker</p>
                <p className="text-[10px] text-slate-500">NGO Partner</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@example.com', 'password123')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-center transition-colors"
              >
                <p className="text-xs font-semibold text-slate-800">Admin</p>
                <p className="text-[10px] text-slate-500">Government</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
