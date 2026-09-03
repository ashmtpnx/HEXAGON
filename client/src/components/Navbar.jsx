import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hexagon, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass-card rounded-none border-t-0 border-x-0 border-b border-surface-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <Hexagon className="h-8 w-8 text-primary-400 transition-transform group-hover:rotate-90 duration-300" />
              <span className="text-xl font-bold tracking-wider gradient-text">HEXAGON</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  to={user.role === 'admin' ? '/admin' : '/dashboard'} 
                  className={`text-sm font-medium transition-colors hover:text-primary-400 ${
                    location.pathname.includes('/dashboard') || location.pathname.includes('/admin') 
                      ? 'text-primary-400' 
                      : 'text-surface-300'
                  }`}
                >
                  Dashboard
                </Link>
                {user.role === 'vle' && (
                  <Link 
                    to="/assisted" 
                    className={`text-sm font-medium transition-colors hover:text-primary-400 ${
                      location.pathname.includes('/assisted') ? 'text-primary-400' : 'text-surface-300'
                    }`}
                  >
                    Assisted Mode
                  </Link>
                )}
                <div className="h-6 w-px bg-surface-700 mx-2"></div>
                <div className="flex items-center gap-2 text-surface-300 text-sm">
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-800 border border-surface-700">
                    {user.role.toUpperCase()}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-surface-400 hover:text-danger-400 transition-colors ml-2 rounded-full hover:bg-surface-800"
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
        </div>
      </div>
    </nav>
  );
}
