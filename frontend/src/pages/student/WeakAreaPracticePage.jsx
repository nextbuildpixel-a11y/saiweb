import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { personalizationService } from '../../services/personalizationService';
import { AlertTriangle, Target, CheckCircle2, ArrowRight, ShieldAlert, Sparkles, RefreshCw, Code, BookOpen } from 'lucide-react';

function WeakAreaPracticePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWeakAreas = async () => {
      try {
        const res = await personalizationService.getWeakAreas();
        setData(res);
      } catch (err) {
        setError('Failed to load weak-area diagnostics');
      } finally {
        setLoading(false);
      }
    };
    fetchWeakAreas();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 text-xs gap-2 font-sans">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" /> Analyzing Weak Areas & Skill Gaps...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-4 text-rose-300 text-xs font-sans">
        {error || 'No weak area data available'}
      </div>
    );
  }

  const topWeak = data.topPriorityWeakArea;

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/50 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-1">
          <AlertTriangle className="w-3.5 h-3.5" /> Weak-Area Detection Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Targeted Weak-Area Practice</h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Automated performance diagnostics identifying skill gaps and recommending tailored problem sets to raise your score.
        </p>
      </div>

      {/* Top Priority Weak Area Hero Card */}
      {topWeak && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
                HIGH PRIORITY WEAKNESS
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">{topWeak.skill}</h2>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-rose-400">{topWeak.score}%</span>
              <span className="block text-[10px] text-slate-400 uppercase font-bold">CURRENT PROFICIENCY</span>
            </div>
          </div>

          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> AI Practice Recommendation
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">{topWeak.recommendation || 'Practice 5 Arrays problems, 3 Linked List problems, and 2 Tree problems.'}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/coding')}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Code className="w-4 h-4" /> Launch {topWeak.skill} Problem Workspace <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/improvement-plan')}
              className="py-3 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" /> View 7-Day Plan
            </button>
          </div>
        </div>
      )}

      {/* Categorized Skills Breakdown */}
      <div className="space-y-4">
        <h3 className="font-bold text-white text-sm">Skill Diagnostics Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Weak Skills List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-rose-400 uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Weak Skills (&lt;60%)
            </span>
            <div className="space-y-2">
              {data.weakSkills?.map((s, idx) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <span className="font-bold text-white">{s.skill}</span>
                  <span className="font-extrabold text-rose-400">{s.score}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strong & Good Skills List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Strong & Good Skills (&gt;70%)
            </span>
            <div className="space-y-2">
              {[...(data.strongSkills || []), ...(data.goodSkills || [])].map((s, idx) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <span className="font-bold text-white">{s.skill}</span>
                  <span className="font-extrabold text-emerald-400">{s.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeakAreaPracticePage;
