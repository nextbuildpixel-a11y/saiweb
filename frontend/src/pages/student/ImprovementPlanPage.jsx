import React, { useState, useEffect } from 'react';
import { personalizationService } from '../../services/personalizationService';
import { Calendar, CheckCircle2, Circle, Sparkles, RefreshCw, BookOpen, Layers } from 'lucide-react';

function ImprovementPlanPage() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [duration, setDuration] = useState(7);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCurrentPlan();
  }, []);

  const loadCurrentPlan = async () => {
    setLoading(true);
    try {
      const plan = await personalizationService.getCurrentPlan();
      setCurrentPlan(plan);
      if (plan.durationDays) setDuration(plan.durationDays);
    } catch (err) {
      setError('Failed to fetch current improvement roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async (selectedDays) => {
    setGenerating(true);
    setError(null);
    setDuration(selectedDays);

    try {
      await personalizationService.generatePlan(selectedDays);
      loadCurrentPlan();
    } catch (err) {
      setError('Failed to generate personalized preparation plan');
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = (index) => {
    if (!currentPlan || !currentPlan.dailyTasks) return;
    const updated = [...currentPlan.dailyTasks];
    updated[index].completed = !updated[index].completed;
    setCurrentPlan({ ...currentPlan, dailyTasks: updated });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 text-xs gap-2 font-sans">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" /> Generating Customized Preparation Roadmap...
      </div>
    );
  }

  const completedCount = currentPlan?.dailyTasks?.filter(t => t.completed).length || 0;
  const totalCount = currentPlan?.dailyTasks?.length || 1;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-1">
          <Calendar className="w-3.5 h-3.5" /> Personalized Placement Roadmap
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Customized Preparation Plan</h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Dynamic 7-day, 15-day, and 30-day structured daily schedules targeted at resolving your weak areas before campus drives.
        </p>
      </div>

      {error && (
        <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-4 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Plan Duration Selector Tabs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white text-xs">Select Roadmap Duration:</span>
        </div>

        <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
          {[7, 15, 30].map((d) => (
            <button
              key={d}
              onClick={() => handleGeneratePlan(d)}
              disabled={generating}
              className={`py-2 px-5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                duration === d
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {d}-Day Plan
            </button>
          ))}
        </div>
      </div>

      {/* Plan Details & Progress Card */}
      {currentPlan && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded font-bold text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                TARGETED WEAKNESS: {currentPlan.skillName || 'DSA'}
              </span>
              <h2 className="text-xl font-bold text-white mt-1">{currentPlan.title}</h2>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-emerald-400">{progressPct}%</span>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">ROADMAP COMPLETION</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
          </div>

          {/* Daily Schedule Timeline */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-xs uppercase text-slate-400">Daily Task Breakdown</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {currentPlan.dailyTasks?.map((task, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleTask(idx)}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    task.completed
                      ? 'bg-slate-950/60 border-emerald-500/30 opacity-70'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 shrink-0" />
                    )}
                    <div>
                      <span className={`font-bold text-xs block ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                        {task.title}
                      </span>
                      <p className="text-[11px] text-slate-400">{task.activity}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${task.completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
                    {task.completed ? 'COMPLETED' : 'PENDING'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImprovementPlanPage;
