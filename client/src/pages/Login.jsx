import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hexagon, Lock, User as UserIcon, Mail } from 'lucide-react';

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
      if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('demo123');
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-surface-950">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-900/20 rounded-full blur-[100px] pointer-events-none"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 glass-card p-8 relative z-10">
        <div>
          <div className="flex justify-center">
            <Hexagon className="h-12 w-12 text-primary-400" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to HEXAGON
          </h2>
          <p className="mt-2 text-center text-sm text-surface-400">
            Unified platform for marginalized entrepreneurs
          </p>
        </div>
        
        {/* Demo Quick Select */}
        <div className="bg-surface-800/50 border border-surface-700 rounded-lg p-4 mb-6">
          <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 text-center">Demo Accounts (Click to fill)</p>
          <div className="grid grid-cols-1 gap-2">
            <button onClick={() => handleDemoSelect('applicant@demo.com')} className="text-left text-sm py-2 px-3 rounded bg-surface-800 hover:bg-surface-700 border border-surface-600 transition-colors flex justify-between">
              <span>Standard Applicant</span> <span className="text-surface-500 font-mono text-xs">applicant@demo.com</span>
            </button>
            <button onClick={() => handleDemoSelect('lakshmi@demo.com')} className="text-left text-sm py-2 px-3 rounded bg-danger-900/20 hover:bg-danger-900/40 border border-danger-500/30 transition-colors flex justify-between text-danger-200">
              <span>Rejection Demo</span> <span className="text-danger-400/60 font-mono text-xs">lakshmi@demo.com</span>
            </button>
            <button onClick={() => handleDemoSelect('vle@demo.com')} className="text-left text-sm py-2 px-3 rounded bg-surface-800 hover:bg-surface-700 border border-surface-600 transition-colors flex justify-between">
              <span>VLE Operator</span> <span className="text-surface-500 font-mono text-xs">vle@demo.com</span>
            </button>
            <button onClick={() => handleDemoSelect('admin@demo.com')} className="text-left text-sm py-2 px-3 rounded bg-surface-800 hover:bg-surface-700 border border-surface-600 transition-colors flex justify-between">
              <span>Ministry Admin</span> <span className="text-surface-500 font-mono text-xs">admin@demo.com</span>
            </button>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-danger-500/10 border border-danger-500/50 text-danger-400 px-4 py-3 rounded relative text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-surface-500" />
              </div>
              <input
                type="email"
                required
                className="input-field pl-10"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-surface-500" />
              </div>
              <input
                type="password"
                required
                className="input-field pl-10"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex justify-center py-3"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
