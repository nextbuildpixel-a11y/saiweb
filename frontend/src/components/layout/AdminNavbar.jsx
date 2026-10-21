import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, LogOut, Sparkles } from 'lucide-react';

function AdminNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="h-16 bg-slate-900/90 border-b border-purple-900/40 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <Link to="/admin/dashboard" className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 font-bold">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="font-extrabold text-white text-base leading-tight tracking-tight">
            Admin Control Center
          </div>
          <span className="text-[10px] text-purple-400 font-semibold block uppercase tracking-wider">System Administration</span>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 hidden sm:inline-block">
          ROLE_ADMIN Authorized
        </span>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </header>
  );
}

export default AdminNavbar;
