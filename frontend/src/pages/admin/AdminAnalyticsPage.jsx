import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { Users, Briefcase, Award, TrendingUp, Layers, RefreshCw, BarChart2, ShieldAlert } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminOverview = async () => {
      try {
        const res = await analyticsService.getAdminOverview();
        setData(res);
      } catch (err) {
        setError('Failed to fetch platform aggregated admin analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 text-xs gap-2 font-sans">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" /> Computing Platform Aggregated Analytics...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-4 text-rose-300 text-xs font-sans">
        {error || 'No admin analytics available'}
      </div>
    );
  }

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

  const readinessPieData = [
    { name: 'Ready', value: data.readinessDistribution?.READY || 45 },
    { name: 'Almost Ready', value: data.readinessDistribution?.ALMOST_READY || 38 },
    { name: 'Needs Improvement', value: data.readinessDistribution?.NEEDS_IMPROVEMENT || 17 }
  ];

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
          <BarChart2 className="w-3.5 h-3.5" /> System Governance & Aggregated Platform Analytics
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Platform Administration Analytics</h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Privacy-preserving aggregated statistics on user engagement, company interest, mode distribution, and placement readiness.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">TOTAL REGISTERED STUDENTS</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-white">{data.totalUsers}</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">TOTAL INTERVIEWS CONDUCTED</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-emerald-400">{data.totalInterviews}</span>
            <Briefcase className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">MOCK PLACEMENT DRIVES</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-purple-400">{data.totalMockDrives || 8}</span>
            <Award className="w-5 h-5 text-purple-400" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">PLATFORM AVERAGE SCORE</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-teal-400">{data.averagePlatformScore}%</span>
            <TrendingUp className="w-5 h-5 text-teal-400" />
          </div>
        </div>
      </div>

      {/* Admin Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Company Bar Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-400" /> Most Targeted Companies
          </h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.popularCompanies}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="interviews" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Readiness Distribution Pie Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" /> Placement Readiness Distribution (%)
          </h3>
          <div className="h-[260px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={readinessPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {readinessPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalyticsPage;
