import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import { 
  Target, 
  Sparkles, 
  PlayCircle, 
  FileText, 
  Building2, 
  Brain, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Award, 
  TrendingUp, 
  RefreshCw,
  AlertCircle,
  ArrowRight,
  MessageSquare,
  Mic,
  Video,
  Zap,
  BookOpen
} from 'lucide-react';

function DashboardPage() {
  const { user: authUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardService.getStudentDashboard();
      setData(result);
      if (result.dailyTasks) {
        setTasks(result.dailyTasks);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics from Spring Boot server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const toggleTask = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 h-32"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 h-28"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 h-56"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-rose-800/80 rounded-2xl p-6 text-rose-300 text-xs space-y-4 max-w-md w-full text-center shadow-xl">
          <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Dashboard Service Error</h3>
            <p className="text-slate-400 mt-1">{error}</p>
          </div>
          <button
            onClick={loadDashboard}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/20"
          >
            <RefreshCw className="w-4 h-4" /> Retry Fetching Dashboard
          </button>
        </div>
      </div>
    );
  }

  const completedInterviews = data?.completedInterviews ?? 0;
  const totalInterviews = data?.totalInterviews ?? (data?.recentInterviews?.length ?? 0);
  const averageScore = data?.averageScore ?? 0;
  const currentStreak = data?.currentStreak ?? (data?.streakDays ?? 0);
  const aptitudeProgress = data?.aptitudeProgress ?? 0;

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto">
      {/* 1. Header: Clean Welcome Greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Placement Season 2026 &bull; Active Preparation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {authUser?.fullName || data?.profile?.fullName || 'Candidate'}!
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            {data?.profile?.college || 'Engineering Campus'} &bull; {data?.profile?.branch || 'Computer Science'}{' '}
            {data?.profile?.cgpa ? <span className="text-emerald-400 font-semibold">(CGPA: {data.profile.cgpa})</span> : ''}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-bold shadow-sm">
            <Flame className="w-4 h-4 fill-amber-400" /> {currentStreak} Day Prep Streak
          </div>
          <Link
            to="/interview/setup"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" /> Start Interview
          </Link>
        </div>
      </div>

      {/* 2. Quick Stats Bar: 4 Core Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Completed Interviews */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Completed Interviews</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-white">{completedInterviews}</span>
              <span className="text-xs text-slate-500 font-medium">/ {totalInterviews} taken</span>
            </div>
            <span className="text-[10px] text-blue-400 font-medium block">Verified evaluations</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <PlayCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Average Score */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Average Accuracy</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl sm:text-3xl font-black ${averageScore >= 80 ? 'text-emerald-400' : averageScore >= 50 ? 'text-blue-400' : 'text-amber-400'}`}>
                {averageScore}%
              </span>
              <span className="text-xs text-slate-500 font-medium">benchmark</span>
            </div>
            <span className={`text-[10px] font-medium block ${averageScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {averageScore >= 80 ? 'Placement Ready' : averageScore >= 50 ? 'Developing Proficiency' : 'Needs Practice'}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Current Streak */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Current Streak</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-400">{currentStreak}</span>
              <span className="text-xs text-slate-500 font-medium">Days</span>
            </div>
            <span className="text-[10px] text-amber-400/80 font-medium block">Daily drill active</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 fill-amber-400" />
          </div>
        </div>

        {/* Metric 4: Aptitude Progress */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1 flex-1 pr-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Aptitude Progress</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-purple-400">{aptitudeProgress}%</span>
              <span className="text-xs text-slate-500 font-medium">mastery</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800 mt-1">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, aptitudeProgress)}%` }}
              ></div>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Action Center: 3 Prominent CTA Cards (Text, Voice, Video) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" /> Action Center & Interview Simulators
            </h2>
            <p className="text-slate-400 text-xs">Launch a customized AI mock interview in your preferred practice mode.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Text Interview */}
          <div className="bg-gradient-to-b from-slate-900/95 to-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wide">
                  Text Mode
                </span>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white group-hover:text-blue-400 transition-colors">
                  Text Mock Interview
                </h3>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Fast, focused chat-based technical & behavioral questions with real-time factual penalty scoring and feedback.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => navigate('/interview/setup?mode=TEXT')}
                className="w-full py-3 bg-blue-600/15 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 hover:border-transparent rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-600/25 cursor-pointer"
              >
                Start Text Interview <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Voice Interview */}
          <div className="bg-gradient-to-b from-slate-900/95 to-slate-950 border border-slate-800 hover:border-purple-500/50 rounded-3xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <Mic className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wide">
                  Voice Mode
                </span>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white group-hover:text-purple-400 transition-colors">
                  Voice Mock Interview
                </h3>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Realistic conversational practice with browser speech-to-text, audio question readouts, and STAR framework evaluation.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => navigate('/interview/setup?mode=VOICE')}
                className="w-full py-3 bg-purple-600/15 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 hover:border-transparent rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-purple-600/25 cursor-pointer"
              >
                Start Voice Interview <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 3: Video Interview */}
          <div className="bg-gradient-to-b from-slate-900/95 to-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                  <Video className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wide">
                  Video Mode
                </span>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white group-hover:text-cyan-400 transition-colors">
                  Video Mock Interview
                </h3>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  High-fidelity simulated video assessment with webcam preview, verbal pacing analysis, and full post-interview diagnostic reports.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => navigate('/interview/setup?mode=VIDEO')}
                className="w-full py-3 bg-cyan-600/15 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-transparent rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-cyan-600/25 cursor-pointer"
              >
                Start Video Interview <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Placement Readiness & Skill Competency Radar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Readiness Gauge */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between md:col-span-1 shadow-xl space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Placement Readiness Score</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">
                {data?.placementReadiness ?? 0}
              </span>
              <span className="text-slate-500 font-semibold text-sm">/ 100</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Readiness Category:</span>
              <span className="font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 uppercase">
                {data?.readinessStatus ? data.readinessStatus.replace(/_/g, ' ') : 'NEW STUDENT'}
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${data?.placementReadiness ?? 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1">
            <span className="text-slate-400 block font-medium">Priority Focus Skill:</span>
            <span className="text-amber-400 font-bold block">{data?.weakestSkill || 'General Technical & Aptitude'}</span>
            <span className="text-slate-500 text-[11px] block mt-1">{data?.recommendation || 'Complete mock interviews to evaluate strengths.'}</span>
          </div>
        </div>

        {/* Skill Radar Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:col-span-2 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" /> Skill Competency Breakdown
              </h3>
              <p className="text-slate-400 text-xs">Multi-dimensional evaluation across technical and soft skills.</p>
            </div>
            <span className="text-xs text-blue-400 font-semibold">6 Master Dimensions</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data?.skillRadar || []}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="skill" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                <Radar name="Student Skill" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. Two Column Section: Recent Activity Table & Daily Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:col-span-2 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Recent Mock Interviews
            </h3>
            <Link to="/interview/history" className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
              View All History <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {(!data?.recentInterviews || data.recentInterviews.length === 0) ? (
            <div className="py-12 px-4 text-center space-y-3">
              <p className="text-slate-400 text-xs">No mock interviews completed yet.</p>
              <button
                onClick={() => navigate('/interview/setup')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <PlayCircle className="w-4 h-4" /> Start Your First Mock Interview
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3 font-semibold">Company & Role</th>
                    <th className="p-3 font-semibold">Mode</th>
                    <th className="p-3 font-semibold">Score</th>
                    <th className="p-3 font-semibold">Date</th>
                    <th className="p-3 font-semibold text-right">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data?.recentInterviews?.slice(0, 5).map((interview) => (
                    <tr key={interview.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-semibold text-slate-200">
                        <div>{interview.company}</div>
                        <div className="text-[11px] text-slate-500 font-normal">{interview.role}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {interview.mode}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-bold text-xs ${interview.score >= 80 ? 'text-emerald-400' : interview.score >= 50 ? 'text-blue-400' : 'text-amber-400'}`}>
                          {interview.score}%
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{interview.date || 'Recent'}</td>
                      <td className="p-3 text-right">
                        <Link
                          to={`/interview/result/${interview.id}`}
                          className="px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                        >
                          Review Report
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Daily Recommendations & Tasks Checklist */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Daily Task Queue
            </h3>
            <span className="text-xs text-emerald-400 font-bold">
              {tasks.filter(t => t.completed).length} / {tasks.length} Done
            </span>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                  task.completed
                    ? 'bg-slate-950/40 border-slate-800 text-slate-500 line-through'
                    : 'bg-slate-950/80 border-slate-800/80 text-slate-200 hover:border-blue-500/40'
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {}}
                  className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <p className="font-medium leading-snug">{task.title}</p>
                  <span className="text-[10px] text-slate-500 uppercase mt-0.5 block">{task.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
