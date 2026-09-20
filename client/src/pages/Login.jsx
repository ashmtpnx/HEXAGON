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
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface-50">
      <div className="max-w-md w-full space-y-8 glass-card p-8">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary-50 border-2 border-primary-200 flex items-center justify-center">
              <Hexagon className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-2xl font-extrabold text-surface-800">
            Sign in to HEXAGON
          </h2>
          <p className="mt-2 text-center text-sm text-surface-500">
            Unified platform for marginalized entrepreneurs
          </p>
        </div>
        
        {/* Demo Quick Select */}
        <div className="bg-surface-50 border border-surface-200 rounded-lg p-4 mb-6">
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3 text-center">Demo Accounts (Click to fill)</p>
          <div className="grid grid-cols-1 gap-2">
            <button onClick={() => handleDemoSelect('applicant@demo.com')} className="text-left text-sm py-2 px-3 rounded-lg bg-white hover:bg-surface-50 border border-surface-200 transition-colors flex justify-between items-center">
              <span className="font-medium text-surface-700">Standard Applicant</span> <span className="text-surface-400 font-mono text-xs">applicant@demo.com</span>
            </button>
            <button onClick={() => handleDemoSelect('lakshmi@demo.com')} className="text-left text-sm py-2 px-3 rounded-lg bg-danger-50 hover:bg-danger-100 border border-danger-100 transition-colors flex justify-between items-center">
              <span className="font-medium text-danger-600">Rejection Demo</span> <span className="text-danger-400 font-mono text-xs">lakshmi@demo.com</span>
            </button>
            <button onClick={() => handleDemoSelect('vle@demo.com')} className="text-left text-sm py-2 px-3 rounded-lg bg-white hover:bg-surface-50 border border-surface-200 transition-colors flex justify-between items-center">
              <span className="font-medium text-surface-700">VLE Operator</span> <span className="text-surface-400 font-mono text-xs">vle@demo.com</span>
            </button>
            <button onClick={() => handleDemoSelect('admin@demo.com')} className="text-left text-sm py-2 px-3 rounded-lg bg-white hover:bg-surface-50 border border-surface-200 transition-colors flex justify-between items-center">
              <span className="font-medium text-surface-700">Ministry Admin</span> <span className="text-surface-400 font-mono text-xs">admin@demo.com</span>
            </button>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-danger-50 border border-danger-100 text-danger-600 px-4 py-3 rounded-lg relative text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-surface-400" />
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
                <Lock className="h-5 w-5 text-surface-400" />
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
