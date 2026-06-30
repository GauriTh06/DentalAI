import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, Menu, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) => 
    `text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
      isActive(path) 
        ? 'bg-medical-600 text-white shadow-md shadow-medical-500/20' 
        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
    }`;

  return (
    <nav className="glass-panel sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-medical-500 to-primary-500 p-2 rounded-xl text-white shadow-md shadow-medical-500/30">
            <Activity className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
            DentalAI Pro
          </span>
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      {isAuthenticated && (
        <div className="hidden md:flex items-center gap-2">
          <Link to="/about" className={linkClass('/about')}>About</Link>
          {user?.role === 'patient' && (
            <>
              <Link to="/dashboard" className={linkClass('/dashboard')}>Patient Dashboard</Link>
              <Link to="/diagnose" className={linkClass('/diagnose')}>Upload & Diagnose</Link>
              <Link to="/history" className={linkClass('/history')}>My Scans</Link>
            </>
          )}
          {(user?.role === 'admin' || user?.role === 'dentist') && (
            <>
              <Link to="/admin" className={linkClass('/admin')}>Clinical Dashboard</Link>
              <Link to="/history" className={linkClass('/history')}>All Patient Records</Link>
            </>
          )}
        </div>
      )}

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-white">{user?.name}</span>
              <span className="text-xs px-2 py-0.5 mt-0.5 rounded-full font-medium bg-slate-800 text-teal-400 border border-teal-500/20 capitalize">
                {user?.role}
              </span>
            </div>
            <div className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-300">
              <User className="h-5 w-5" />
            </div>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/about"
              className={linkClass('/about')}
            >
              About
            </Link>
            <Link 
              to="/login" 
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/login?tab=register" 
              className="text-sm font-medium bg-gradient-to-r from-medical-600 to-primary-600 hover:from-medical-500 hover:to-primary-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-medical-600/20 transition-all duration-200"
            >
              Register
            </Link>
          </div>
        )}
        
        {/* Mobile Menu Toggle */}
        {isAuthenticated && (
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="absolute top-full left-0 w-full bg-navy-950/95 backdrop-blur-lg border-b border-slate-800 flex flex-col p-4 gap-2 md:hidden">
          {user?.role === 'patient' && (
            <>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={linkClass('/dashboard')}>Patient Dashboard</Link>
              <Link to="/diagnose" onClick={() => setMobileMenuOpen(false)} className={linkClass('/diagnose')}>Upload & Diagnose</Link>
              <Link to="/history" onClick={() => setMobileMenuOpen(false)} className={linkClass('/history')}>My Scans</Link>
            </>
          )}
          {(user?.role === 'admin' || user?.role === 'dentist') && (
            <>
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className={linkClass('/admin')}>Clinical Dashboard</Link>
              <Link to="/history" onClick={() => setMobileMenuOpen(false)} className={linkClass('/history')}>All Patient Records</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
