import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { 
  Award, 
  TrendingUp, 
  Target, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  BarChart2, 
  Layers, 
  Building2,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';

function SkillAnalyticsPage() {
  const [data, setData] = useState(null);
  const [companyReadiness, setCompanyReadiness] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [perf, comp] = await Promise.all([
          analyticsService.getStudentPerformance(),
          analyticsService.getCompanyReadiness()
        ]);
        setData(perf);
        setCompanyReadiness(comp);
      } catch (err) {
        setError('Failed to load performance analytics and skill reports');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 text-xs gap-2 font-sans">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" /> Computing Skill Scores & Performance Analytics...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-4 text-rose-300 text-xs font-sans">
        {error || 'No analytics data available'}
      </div>
    );
  }

  const modeBarData = [
    { mode: 'Text Mode', score: data.modeBreakdown?.TEXT || 82 },
    { mode: 'Voice Mode', score: data.modeBreakdown?.VOICE || 76 },
    { mode: 'Video Mode', score: data.modeBreakdown?.VIDEO || 79 }
  ];

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-1">
          <BarChart2 className="w-3.5 h-3.5" /> Performance & Skill Analytics Hub
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Student Skill Radar & Reports</h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Comprehensive analytics tracking interview progression, core skill scores, company-role readiness, and mode breakdowns.
        </p>
      </div>

      {/* Top Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">PLACEMENT READINESS</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-emerald-400">{data.placementReadinessScore}%</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${data.placementStatus === 'READY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              {data.placementStatus}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">AVERAGE INTERVIEW SCORE</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-blue-400">{data.averageScore}%</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">HIGHEST SCORE ACHIEVED</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-purple-400">{data.highestScore}%</span>
            <Award className="w-5 h-5 text-purple-400" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-1">
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">COMPLETED INTERVIEWS</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-teal-400">{data.completedInterviews} / {data.totalInterviews}</span>
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Skill Radar Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" /> Core Skill Proficiency Radar
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data.skillRadar}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="skill" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                <Radar name="Candidate Skill" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Interview Progress Trend Line Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" /> Interview Score Progression Trend
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mode Performance & Company Readiness Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mode Breakdown Bar Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" /> Performance by Interview Mode
          </h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modeBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="mode" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="score" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Target Company Readiness */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" /> Target Company Readiness Index
          </h3>
          <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
            {companyReadiness.map((cr, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white text-xs block">{cr.companyName} &bull; {cr.roleTitle}</span>
                    <span className="text-[10px] text-slate-500">{cr.industry}</span>
                  </div>
                  <span className="text-sm font-extrabold text-emerald-400">{cr.overallReadiness}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${cr.overallReadiness}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkillAnalyticsPage;
