import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  Bell, 
  Flame, 
  User, 
  LogOut, 
  ChevronDown, 
  Menu, 
  X,
  GraduationCap
} from 'lucide-react';

function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Brand & Sidebar Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-white text-base leading-tight tracking-tight flex items-center gap-1">
              AI Interview Coach
            </div>
            <span className="text-[10px] text-blue-400 font-semibold block uppercase tracking-wider">Placement Prep</span>
          </div>
        </Link>
      </div>

      {/* Middle: Global Search Bar */}
      <div className="hidden lg:flex items-center relative w-72">
        <Search className="w-4 h-4 text-slate-500 absolute left-3" />
        <input
          type="text"
          placeholder="Search companies, roles, DSA..."
          className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Right: User Badges & Profile Dropdown */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Streak Counter */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 fill-amber-400" />
          <span>4 Day Streak</span>
        </div>

        {/* Notifications Icon */}
        <button className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 relative transition-colors cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-blue-500 absolute top-1.5 right-1.5 animate-ping"></span>
          <span className="w-2 h-2 rounded-full bg-blue-500 absolute top-1.5 right-1.5"></span>
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName || "Avatar"} className="w-full h-full object-cover" />
              ) : (
                <span>{user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'S'}</span>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-white leading-tight">{user?.fullName || 'Student'}</div>
              <span className="text-[10px] text-slate-400 block">{user?.email || 'student@college.edu'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs overflow-hidden shrink-0">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName || "Avatar"} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'S'}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white truncate">{user?.fullName || 'Student'}</p>
                  <p className="text-slate-400 text-[11px] truncate">{user?.email}</p>
                </div>
              </div>
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <User className="w-3.5 h-3.5 text-blue-400" /> View Candidate Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-rose-950/40 text-rose-400 transition-colors text-left cursor-pointer border-t border-slate-800 mt-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
