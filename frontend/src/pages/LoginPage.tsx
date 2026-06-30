import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldAlert, KeyRound } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'Patient', email: 'patient@dental.ai', password: 'patient123' },
  { label: 'Dentist', email: 'dentist@dental.ai', password: 'dentist123' },
  { label: 'Admin',   email: 'admin@dental.ai',   password: 'admin123'   },
];

export const LoginPage: React.FC = () => {
  const { login, register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient' // default
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const quickFill = (email: string, password: string) => {
    setFormData(prev => ({ ...prev, email, password }));
    setError(null);
  };

  // Set tab based on URL search query
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setIsRegistering(true);
    } else {
      setIsRegistering(false);
    }
  }, [searchParams]);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'patient') {
        navigate('/dashboard');
      } else {
        navigate('/admin');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        if (!formData.name.trim()) throw new Error('Please enter your name');
        await register(formData);
      } else {
        await login({ email: formData.email, password: formData.password });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12 relative">
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-medical-500 to-primary-500 p-2.5 rounded-2xl text-white mb-3 shadow-md">
            <Activity className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white text-center">
            {isRegistering ? 'Create DentalAI Account' : 'Attending Sign In'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRegistering ? 'Get early diagnostic screenings in seconds' : 'Access your dental diagnostics dashboard'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-900/80 rounded-xl p-1 mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(false);
              setError(null);
            }}
            className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-colors ${
              !isRegistering ? 'bg-medical-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(true);
              setError(null);
            }}
            className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-colors ${
              isRegistering ? 'bg-medical-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl p-3.5 mb-5 flex gap-2.5 items-start text-xs text-rose-400">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Demo Credentials Panel — only shown on Sign In tab */}
        {!isRegistering && (
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-3.5 mb-4">
            <div className="flex items-center gap-1.5 mb-2.5">
              <KeyRound className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Demo Accounts — click to fill</span>
            </div>
            <div className="flex gap-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => quickFill(acc.email, acc.password)}
                  className="flex-1 text-center py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[10px] font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  {acc.label}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-500 mt-2 text-center">Works offline — no backend required</p>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Dr. John Doe / Jane Smith"
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-medical-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full bg-slate-900/60 border border-slate-800 focus:border-medical-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-slate-900/60 border border-slate-800 focus:border-medical-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors"
            />
          </div>

          {isRegistering && (
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Account Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-medical-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-white transition-colors"
              >
                <option value="patient" className="bg-slate-900">Patient (View diagnostic logs)</option>
                <option value="dentist" className="bg-slate-900">Dentist (Clinical reviewer)</option>
                <option value="admin" className="bg-slate-900">System Admin</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-medical-600 to-primary-600 hover:from-medical-500 hover:to-primary-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-medical-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
      </div>
    </div>
  );
};
