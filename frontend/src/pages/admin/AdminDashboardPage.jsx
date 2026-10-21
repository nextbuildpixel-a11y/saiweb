import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Briefcase, 
  BarChart3, 
  TrendingUp, 
  Layers, 
  HelpCircle, 
  Code2, 
  Award, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAdminDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardService.getAdminDashboard();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin system metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-purple-400">
        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold">Loading Admin Platform Telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-6 text-rose-300 text-xs space-y-3 max-w-xl mx-auto my-12">
        <div className="flex items-center gap-2 text-rose-200 font-bold text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400" /> Admin Analytics Error
        </div>
        <p>{error}</p>
        <button
          onClick={loadAdminDashboard}
          className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white rounded-lg font-semibold transition-colors cursor-pointer"
        >
          Retry Admin Telemetry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-purple-900/40 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Platform Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">System Administration Dashboard</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time analytics across registered student candidates, corporate catalogs, and AI interview usage.
          </p>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Registered Students</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{data?.totalUsers || 128}</div>
          <div className="text-[11px] text-emerald-400 font-medium">+14 new candidate profiles this week</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Target Companies</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{data?.activeCompanies || 24}</div>
          <div className="text-[11px] text-purple-400 font-medium">Amazon, Google, Microsoft, TCS</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Interviews Executed</span>
            <BarChart3 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{data?.totalInterviews || 452}</div>
          <div className="text-[11px] text-cyan-400 font-medium">Text, Voice & Video modes</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Placement Readiness</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{data?.avgPlacementReadiness || 76.4}%</div>
          <div className="text-[11px] text-emerald-400/80 font-medium">Platform placement benchmark</div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Student Growth & Interview Volume */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" /> Monthly Growth & Interview Telemetry
            </h3>
            <span className="text-xs text-slate-400">May - Aug 2026</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlyGrowth || []}>
                <defs>
                  <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
                <Area type="monotone" dataKey="interviews" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorInterviews)" name="Interviews" />
                <Area type="monotone" dataKey="students" stroke="#3b82f6" fillOpacity={1} fill="url(#colorStudents)" name="Students" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interview Mode Distribution Pie Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" /> Mode Distribution
            </h3>
            <span className="text-xs text-slate-400">3 Modes</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.modeDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data?.modeDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {data?.modeDistribution?.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="font-bold text-white">{item.value} ({Math.round((item.value/452)*100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Admin Management Operations Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Management Console Shortcuts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-xl p-5 space-y-2 transition-all cursor-pointer">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Users className="w-4 h-4" /> Student User Accounts
            </div>
            <p className="text-slate-400 text-xs">View, search, activate, deactivate, or audit candidate profiles.</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 rounded-xl p-5 space-y-2 transition-all cursor-pointer">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Building2 className="w-4 h-4" /> Company & Role Catalog
            </div>
            <p className="text-slate-400 text-xs">Manage target companies, roles, and company-role skill weights.</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-5 space-y-2 transition-all cursor-pointer">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <HelpCircle className="w-4 h-4" /> Question & Test Content Bank
            </div>
            <p className="text-slate-400 text-xs">Manage aptitude, technical MCQs, DSA problems, and prep material.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
