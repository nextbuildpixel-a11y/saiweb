import React, { useState, useEffect } from 'react';
import { placementPrepService } from '../../services/placementPrepService';
import { 
  Calculator, 
  BrainCircuit, 
  BookOpen, 
  Code2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  RefreshCw,
  Award,
  Shuffle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Check,
  AlertCircle
} from 'lucide-react';

function AptitudePracticePage() {
  const [category, setCategory] = useState('ALL');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const optionKeys = ['A', 'B', 'C', 'D'];

  const tracks = [
    { key: 'ALL', label: 'All Tracks', icon: BrainCircuit, color: 'text-indigo-400' },
    { key: 'QUANTITATIVE', label: 'Quantitative Ability', icon: Calculator, color: 'text-blue-400' },
    { key: 'LOGICAL', label: 'Logical Reasoning', icon: HelpCircle, color: 'text-purple-400' },
    { key: 'VERBAL', label: 'Verbal Ability', icon: BookOpen, color: 'text-emerald-400' },
    { key: 'TECHNICAL_MCQ', label: 'Technical MCQs', icon: Code2, color: 'text-cyan-400' }
  ];

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    setSubmitted(false);
    setReport(null);
    setAnswers({});

    try {
      const data = await placementPrepService.getQuestions(category, 'MEDIUM');
      // Ensure local randomization as well
      const randomized = [...(data || [])].sort(() => Math.random() - 0.5);
      setQuestions(randomized);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load test questions from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [category]);

  const shuffleCurrentQuestions = () => {
    if (submitted) return;
    setQuestions(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  const handleOptionSelect = (qId, optionKey) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: optionKey }));
  };

  const handleSubmitTest = async (e) => {
    e.preventDefault();
    const answeredCount = Object.keys(answers).length;
    if (answeredCount === 0) {
      alert('Please select an answer for at least one question before submitting.');
      return;
    }

    setLoading(true);
    try {
      const result = await placementPrepService.submitTestAttempt(category, answers);
      setReport(result);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit test attempt');
    } finally {
      setLoading(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-1">
            <BrainCircuit className="w-3.5 h-3.5" /> Placement Aptitude & Technical Simulator
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Comprehensive Aptitude & MCQ Question Bank
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Curated placement questions across Quantitative Ability, Logical Reasoning, Verbal Ability, and Technical MCQs with verified step-by-step solutions.
          </p>
        </div>
      </div>

      {/* 2. Track Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex flex-wrap gap-2">
          {tracks.map((tab) => {
            const Icon = tab.icon;
            const isActive = category === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setCategory(tab.key)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab.color}`} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Shuffle Button */}
        {!submitted && questions.length > 1 && (
          <button
            onClick={shuffleCurrentQuestions}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Randomize question order"
          >
            <Shuffle className="w-3.5 h-3.5 text-indigo-400" /> Randomize Order
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-950/60 border border-rose-800/80 rounded-2xl p-4 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* 3. Test Score Summary Report */}
      {submitted && report && (
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
                <Check className="w-3.5 h-3.5" /> Evaluation Completed
              </div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" /> Test Performance Report
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 block font-semibold">Overall Accuracy</span>
              <span className={`text-3xl font-black ${report.scorePercentage >= 70 ? 'text-emerald-400' : report.scorePercentage >= 40 ? 'text-blue-400' : 'text-amber-400'}`}>
                {report.scorePercentage}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <span className="text-slate-400 block text-[11px] font-medium">Total Questions</span>
              <span className="font-extrabold text-white text-lg mt-1 block">{questions.length}</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <span className="text-slate-400 block text-[11px] font-medium">Answered</span>
              <span className="font-extrabold text-blue-400 text-lg mt-1 block">{report.totalQuestions}</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <span className="text-slate-400 block text-[11px] font-medium">Correct</span>
              <span className="font-extrabold text-emerald-400 text-lg mt-1 block">{report.correctCount}</span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
              <span className="text-slate-400 block text-[11px] font-medium">Track</span>
              <span className="font-extrabold text-indigo-400 text-sm mt-1.5 block">{category}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={loadQuestions}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retake / Practice Again
            </button>
          </div>
        </div>
      )}

      {/* 4. Progress Indicator */}
      {!submitted && !loading && questions.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Progress:</span>
            <span className="text-indigo-400 font-bold">{answeredCount} of {totalCount} Answered</span>
          </div>
          <div className="w-48 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(answeredCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 5. Question List */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3 text-indigo-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <p className="text-xs font-semibold">Loading placement practice questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <p className="text-slate-400 text-xs">No questions found for this track.</p>
          <button
            onClick={loadQuestions}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
          >
            Reload Questions
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmitTest} className="space-y-6">
          {questions.map((q, idx) => {
            const questionTitle = q.question || q.questionText;
            const correctOpt = q.correctAnswer || q.correctOption;

            return (
              <div key={q.id} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
                <div className="flex flex-wrap justify-between items-center gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      QUESTION {idx + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {q.topic || q.category}
                    </span>
                  </div>
                  <span className="text-slate-500 font-semibold uppercase text-[11px]">{q.difficulty || 'MEDIUM'}</span>
                </div>

                <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                  {questionTitle}
                </p>

                {/* Options */}
                <div className="space-y-2.5 pt-1">
                  {q.options?.map((opt, optIdx) => {
                    const key = optionKeys[optIdx];
                    const isSelected = answers[q.id] === key;
                    const isCorrect = correctOpt === key;

                    let optStyle = 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700';
                    if (submitted) {
                      if (isCorrect) {
                        optStyle = 'bg-emerald-950/50 border-emerald-500/70 text-emerald-300 font-bold';
                      } else if (isSelected && !isCorrect) {
                        optStyle = 'bg-rose-950/50 border-rose-500/70 text-rose-300 font-bold';
                      }
                    } else if (isSelected) {
                      optStyle = 'bg-indigo-600/20 border-indigo-500 text-white font-bold shadow-md shadow-indigo-600/10';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleOptionSelect(q.id, key)}
                        className={`w-full p-3.5 rounded-2xl border text-xs text-left transition-all flex items-center justify-between cursor-pointer ${optStyle}`}
                      >
                        <span className="leading-snug">
                          <span className="font-extrabold text-indigo-400 mr-2.5">({key})</span> {opt}
                        </span>
                        {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                        {submitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation display after submission */}
                {submitted && q.explanation && (
                  <div className="bg-slate-950 border border-indigo-500/20 rounded-2xl p-4 text-xs space-y-1.5 text-slate-300 mt-2">
                    <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Step-by-Step Explanation
                    </span>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}

          {!submitted && questions.length > 0 && (
            <div className="sticky bottom-4 z-20">
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-extrabold text-sm transition-all shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                Submit Answers & Evaluate Score ({answeredCount}/{totalCount} Completed)
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

export default AptitudePracticePage;
