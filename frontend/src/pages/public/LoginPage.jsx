import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginStudent } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginStudent(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to backend server. Ensure your backend is deployed/running and reachable.');
      } else {
        setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('student@aiinterview.com');
    setPassword('student123');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-1">
            <UserCheck className="w-3.5 h-3.5" /> Student Portal Access
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Student Login</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Prepare for placement drives with AI mock interviews.
          </p>
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-3 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Demo User Helper Button */}
        <button
          onClick={handleDemoFill}
          type="button"
          className="w-full py-2 px-3 bg-blue-950/50 hover:bg-blue-900/50 border border-blue-800/50 text-blue-300 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Autofill Demo Student (`student@aiinterview.com`)
        </button>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">College / Student Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Login to Student Account'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-800/80 text-center space-y-2 text-xs text-slate-400">
          <div>
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:underline font-medium">
              Register Student Profile
            </Link>
          </div>
          <div>
            Are you a Faculty / System Admin?{' '}
            <Link to="/admin/login" className="text-indigo-400 hover:underline font-medium inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Admin Login Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
