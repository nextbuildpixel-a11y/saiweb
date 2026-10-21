import React, { useState } from 'react';
import { placementPrepService } from '../../services/placementPrepService';
import { 
  Users, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  RefreshCw,
  HelpCircle
} from 'lucide-react';

function BehavioralStarPage() {
  const hrQuestions = [
    "Tell me about a time when you faced a major technical challenge during a project and how you resolved it.",
    "Describe a situation where you had a conflict with a team member. How did you handle it?",
    "Give an example of a time when you had to learn a new technology under tight deadlines.",
    "Tell me about a time when a project failed or missed a deadline. What did you learn?"
  ];

  const [selectedQuestion, setSelectedQuestion] = useState(hrQuestions[0]);
  const [answerText, setAnswerText] = useState('');
  const [evalResult, setEvalResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleEvaluateStar = async (e) => {
    e.preventDefault();
    if (!answerText.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await placementPrepService.evaluateStar(selectedQuestion, answerText);
      setEvalResult(result);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to evaluate STAR framework');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-1">
          <Users className="w-3.5 h-3.5" /> Behavioral STAR Framework Evaluator
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">HR & Behavioral Interview Workspace</h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Practice situational HR questions using the STAR framework (Situation, Task, Action, Result) with AI breakdown feedback.
        </p>
      </div>

      {error && (
        <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-4 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* STAR Framework Guidance */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
          <span className="font-bold text-blue-400 block">S — Situation</span>
          <p className="text-[11px] text-slate-400">Describe the project background and context.</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
          <span className="font-bold text-purple-400 block">T — Task</span>
          <p className="text-[11px] text-slate-400">Explain your target goal or responsibility.</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
          <span className="font-bold text-emerald-400 block">A — Action</span>
          <p className="text-[11px] text-slate-400">Detail the specific steps you personally took.</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
          <span className="font-bold text-amber-400 block">R — Result</span>
          <p className="text-[11px] text-slate-400">Quantify the final outcome or impact metrics.</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleEvaluateStar} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-400" /> Select Behavioral Question
          </label>
          <select
            value={selectedQuestion}
            onChange={(e) => setSelectedQuestion(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            {hrQuestions.map((q, idx) => (
              <option key={idx} value={q}>{q}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-200 block">Your STAR Answer Response</label>
          <textarea
            rows={6}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Structure your answer: SITUATION: ... TASK: ... ACTION: ... RESULT: ..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans leading-relaxed"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all shadow-xl shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating STAR Framework...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Evaluate STAR Framework Structure
            </>
          )}
        </button>
      </form>

      {/* AI STAR Evaluation Feedback Overlay */}
      {evalResult && (
        <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> STAR Framework Evaluation Score
            </h3>
            <span className={`text-xl font-extrabold ${evalResult.overallScore === 0 ? 'text-rose-400' : 'text-purple-400'}`}>
              {evalResult.overallScore}%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center font-bold">
            <div className={`p-3 rounded-xl border ${evalResult.situationPresent ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300' : 'bg-rose-950/40 border-rose-500/60 text-rose-300'}`}>
              <span>Situation</span>
            </div>
            <div className={`p-3 rounded-xl border ${evalResult.taskPresent ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300' : 'bg-rose-950/40 border-rose-500/60 text-rose-300'}`}>
              <span>Task</span>
            </div>
            <div className={`p-3 rounded-xl border ${evalResult.actionPresent ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300' : 'bg-rose-950/40 border-rose-500/60 text-rose-300'}`}>
              <span>Action</span>
            </div>
            <div className={`p-3 rounded-xl border ${evalResult.resultPresent ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300' : 'bg-rose-950/40 border-rose-500/60 text-rose-300'}`}>
              <span>Result</span>
            </div>
          </div>

          {evalResult.missingComponents?.length > 0 && (
            <div className="bg-slate-950 border border-rose-500/20 rounded-xl p-4 text-xs space-y-2">
              <span className="font-bold text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Missing STAR Components to Include:
              </span>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {evalResult.missingComponents.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BehavioralStarPage;
