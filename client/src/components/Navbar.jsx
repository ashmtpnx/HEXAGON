import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hexagon, LogOut, User as UserIcon, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMobile = () => setMobileMenuOpen(false);

  const navLinkClass = (path) =>
    `text-sm font-medium transition-colors relative py-1 ${
      location.pathname.includes(path)
        ? 'text-primary-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-accent-500 after:rounded-full'
        : 'text-surface-500 hover:text-primary-600'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-surface-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group" onClick={closeMobile}>
              <Hexagon className="h-8 w-8 text-primary-600 transition-transform group-hover:rotate-12 duration-300" />
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-wider text-primary-600">HEXAGON</span>
                <span className="text-[9px] font-medium text-surface-400 tracking-widest uppercase">Gov Platform</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-5">
            {user ? (
              <>
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className={navLinkClass('/dashboard') + ' ' + navLinkClass('/admin')}>
                  Dashboard
                </Link>
                {user.role === 'vle' && (
                  <Link to="/assisted" className={navLinkClass('/assisted')}>
                    Assisted Mode
                  </Link>
                )}
                <div className="h-6 w-px bg-surface-200 mx-1"></div>
                <div className="flex items-center gap-2 text-surface-600 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary-50 border border-primary-200 flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="hidden sm:inline font-medium text-surface-700">{user.name}</span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-surface-100 border border-surface-200 text-surface-500">
                    {user.role.toUpperCase()}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-surface-400 hover:text-danger-500 transition-colors ml-1 rounded-lg hover:bg-danger-50"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary">
                Login / Start Demo
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-surface-500 hover:text-primary-600 rounded-lg hover:bg-surface-50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-200 bg-white animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
          <div className="px-4 py-4 space-y-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 pb-3 border-b border-surface-200">
                  <div className="w-9 h-9 rounded-full bg-primary-50 border border-primary-200 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-800">{user.name}</p>
                    <p className="text-xs text-surface-500">{user.role.toUpperCase()}</p>
                  </div>
                </div>
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="block py-2.5 px-3 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
                  onClick={closeMobile}
                >
                  Dashboard
                </Link>
                {user.role === 'vle' && (
                  <Link
                    to="/assisted"
                    className="block py-2.5 px-3 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
                    onClick={closeMobile}
                  >
                    Assisted Mode
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    to="/admin/schemes"
                    className="block py-2.5 px-3 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors"
                    onClick={closeMobile}
                  >
                    Manage Schemes
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-danger-500 hover:bg-danger-50 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block btn-primary text-center"
                onClick={closeMobile}
              >
                Login / Start Demo
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
