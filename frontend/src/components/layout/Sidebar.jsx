import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlayCircle, 
  FileText, 
  FileCheck, 
  Building2, 
  Brain, 
  Code2, 
  Award, 
  Compass, 
  Bell, 
  User,
  Zap
} from 'lucide-react';

function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Mock Interview', path: '/interview/setup', icon: PlayCircle },
    { label: 'Resume ATS', path: '/resume', icon: FileText },
    { label: 'Job Description', path: '/job-description', icon: FileCheck },
    { label: 'Companies', path: '/companies', icon: Building2 },
    { label: 'Weak Area Practice', path: '/practice/weak-areas', icon: Brain },
    { label: 'DSA & Coding', path: '/coding', icon: Code2 },
    { label: 'Mock Placement Drive', path: '/mock-placement', icon: Award },
    { label: 'Improvement Plan', path: '/improvement-plan', icon: Compass },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 left-0 h-screen md:h-[calc(100vh-4rem)] w-64 bg-slate-900/95 border-r border-slate-800/80 p-4 space-y-6 z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } flex flex-col justify-between overflow-y-auto`}
      >
        <div className="space-y-4">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3">
            Placement Prep Hub
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Placement Readiness Widget */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-blue-400" /> Readiness</span>
            <span className="text-blue-400 font-bold">78%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full w-[78%]"></div>
          </div>
          <span className="text-[10px] text-slate-500 block">Status: Almost Placement Ready</span>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
