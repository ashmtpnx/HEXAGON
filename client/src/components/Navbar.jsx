import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scale, LogOut, User as UserIcon, Menu, X, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    ...(user ? [
      { path: user.role === 'admin' ? '/admin' : '/dashboard', label: 'Dashboard' },
      ...(user.role === 'ngo_worker' || user.role === 'admin' ? [{ path: '/assisted', label: 'Assisted Kiosk' }] : [])
    ] : [])
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      {/* Top Official Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1 px-4 sm:px-8 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>Government of India • Ministry of Social Justice & Empowerment</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-400 text-[11px]">
          <span>National Welfare Portal</span>
          <span>•</span>
          <span className="text-amber-400 font-semibold">SIH 2026 #92</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-amber-500 shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">NyaySetu</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded border border-amber-200">PORTAL</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-none hidden sm:block">Rights-Aware Welfare Matching Platform</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'text-slate-900 bg-slate-100 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</p>
                    <p className="text-[10px] font-mono text-slate-500 capitalize">{user.role?.replace('_', ' ')}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="cleo-btn cleo-btn-secondary py-1.5 px-2.5 text-xs text-slate-600 hover:text-red-600"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="cleo-btn cleo-btn-secondary text-xs">
                  Officer Login
                </Link>
                <Link to="/login" className="cleo-btn cleo-btn-primary text-xs">
                  Applicant Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">{user.name} ({user.role})</span>
              <button
                onClick={handleLogout}
                className="cleo-btn cleo-btn-secondary text-xs text-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-3 mt-3 border-t border-slate-200">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="cleo-btn cleo-btn-primary w-full text-center text-xs"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
