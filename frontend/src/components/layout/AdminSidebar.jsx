import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase, 
  Layers, 
  HelpCircle, 
  Code2, 
  Award, 
  BarChart3, 
  ShieldCheck 
} from 'lucide-react';

function AdminSidebar() {
  const adminItems = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Student Accounts', path: '/admin/users', icon: Users },
    { label: 'Company Profiles', path: '/admin/companies', icon: Building2 },
    { label: 'Job Role Catalog', path: '/admin/roles', icon: Briefcase },
    { label: 'Company-Role Mapping', path: '/admin/company-roles', icon: Layers },
    { label: 'Skill Taxonomy', path: '/admin/skills', icon: Award },
    { label: 'Question Bank', path: '/admin/questions', icon: HelpCircle },
    { label: 'Coding Problems', path: '/admin/coding', icon: Code2 },
    { label: 'System Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800/80 p-4 space-y-6 h-[calc(100vh-4rem)] sticky top-16 hidden md:block overflow-y-auto">
      <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider px-3 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5" /> Management Operations
      </div>

      <nav className="space-y-1">
        {adminItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-purple-600/15 text-purple-400 border border-purple-500/30 shadow-md shadow-purple-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default AdminSidebar;
