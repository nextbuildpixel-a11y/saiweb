import React, { useState, useEffect } from 'react';
import { interviewService } from '../../services/interviewService';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Send, 
  ArrowRight, 
  XCircle, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  Briefcase, 
  RefreshCw,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

function TextInterviewPage() {
  const { id } = useParams();
  const [questionData, setQuestionData] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes per question
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadQuestion = async () => {
    setLoadingQuestion(true);
    setError(null);
    setEvalResult(null);
    setAnswerText('');
    setTimeLeft(180);

    try {
      const data = await interviewService.getCurrentQuestion(id);
      setQuestionData(data);
    } catch (err) {
      if (err.response?.data?.error?.includes('completed')) {
        navigate(`/interview/result/${id}`);
      } else {
        setError(err.response?.data?.error || 'Failed to load current interview question');
      }
    } finally {
      setLoadingQuestion(false);
    }
  };

  useEffect(() => {
    loadQuestion();
  }, [id]);

  // Countdown Timer Hook
  useEffect(() => {
    if (timeLeft <= 0 || evalResult || loadingQuestion) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, evalResult, loadingQuestion]);

  const handleSubmitAnswer = async (e, forcedText) => {
    if (e && e.preventDefault) e.preventDefault();
    if (submitting) return;

    const textToSend = forcedText !== undefined ? forcedText : (answerText.trim() || 'No answer provided');
    setSubmitting(true);
    setError(null);

    try {
      const result = await interviewService.submitAnswer(id, textToSend);
      setEvalResult(result);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to evaluate answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (evalResult?.isFinished) {
      navigate(`/interview/result/${id}`);
    } else {
      loadQuestion();
    }
  };

  const handleEndInterview = async () => {
    if (window.confirm('Are you sure you want to end this interview session early?')) {
      try {
        await interviewService.completeInterview(id);
        navigate(`/interview/result/${id}`);
      } catch (err) {
        navigate(`/interview/result/${id}`);
      }
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loadingQuestion) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-blue-400">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold">Generating AI Interview Question...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-6 text-rose-300 text-xs space-y-3 max-w-xl mx-auto my-12">
        <div className="flex items-center gap-2 text-rose-200 font-bold text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400" /> Interview Session Exception
        </div>
        <p>{error}</p>
        <button
          onClick={loadQuestion}
          className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white rounded-lg font-semibold transition-colors cursor-pointer"
        >
          Retry Current Question
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto">
      {/* Workspace Header: Progress & Timer */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-blue-400" /> {questionData?.companyName}</span>
              &bull;
              <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-purple-400" /> {questionData?.roleTitle}</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Question {questionData?.questionOrder} of {questionData?.totalQuestions}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
              timeLeft < 30 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse' : 'bg-slate-950/80 border-slate-800 text-slate-300'
            }`}>
              <Clock className="w-4 h-4 text-blue-400" />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            <button
              onClick={handleEndInterview}
              className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              End Interview
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-500"
            style={{ width: `${(questionData?.questionOrder / questionData?.totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Current Question Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
        <div className="flex justify-between items-center text-xs">
          <span className="px-2.5 py-0.5 rounded font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            EVALUATED SKILL: {questionData?.skill}
          </span>
          <span className="text-slate-500 uppercase font-semibold">Difficulty: {questionData?.difficulty}</span>
        </div>
        <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
          "{questionData?.questionText}"
        </p>
      </div>

      {/* Live Answer Evaluation Feedback Overlay Modal */}
      {evalResult && (
        <div className={`bg-slate-900 border ${evalResult.overallScore === 0 ? 'border-rose-500/50' : 'border-blue-500/40'} rounded-2xl p-6 space-y-4 shadow-2xl animate-fade-in`}>
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" /> AI Answer Evaluation Feedback
            </h3>
            <span className={`text-xl font-extrabold ${evalResult.overallScore === 0 ? 'text-rose-400' : evalResult.overallScore < 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {evalResult.overallScore}% Overall Score
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-center">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 block text-[11px]">Technical Accuracy</span>
              <span className={`font-bold text-sm ${evalResult.technicalScore === 0 ? 'text-rose-400' : 'text-blue-400'}`}>
                {evalResult.technicalScore}%
              </span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 block text-[11px]">Communication</span>
              <span className={`font-bold text-sm ${evalResult.communicationScore === 0 ? 'text-rose-400' : 'text-purple-400'}`}>
                {evalResult.communicationScore}%
              </span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 block text-[11px]">Status</span>
              <span className={`font-bold text-sm ${evalResult.overallScore === 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {evalResult.overallScore === 0 ? 'NO CREDIT (0%)' : 'EVALUATED'}
              </span>
            </div>
          </div>

          {evalResult.overallScore === 0 && (
            <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-3.5 space-y-1 text-xs">
              <span className="font-bold text-rose-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-400" /> 0% Score Reason:
              </span>
              <p className="text-rose-200/90 leading-relaxed">
                {evalResult.evaluation?.weaknesses?.[0] || '0% assigned: No answer was provided, candidate indicated lack of knowledge, or the response was unrelated to the question topic.'}
              </p>
            </div>
          )}

          {evalResult.evaluation?.strengths && evalResult.evaluation.strengths.length > 0 && (
            <div className="text-xs space-y-1">
              <span className="font-bold text-emerald-400">Key Strengths:</span>
              <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                {evalResult.evaluation.strengths.map((str, idx) => <li key={idx}>{str}</li>)}
              </ul>
            </div>
          )}

          {evalResult.evaluation?.suggestions && evalResult.evaluation.suggestions.length > 0 && (
            <div className="text-xs space-y-1 bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <span className="font-bold text-blue-400">Recommended Topic Preparation:</span>
              <ul className="list-disc list-inside text-slate-300 space-y-0.5 mt-1">
                {evalResult.evaluation.suggestions.map((sug, idx) => <li key={idx}>{sug}</li>)}
              </ul>
            </div>
          )}

          <button
            onClick={handleNextQuestion}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            {evalResult.isFinished ? 'View Final Placement Interview Report' : 'Proceed to Next Question'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Answer Form */}
      {!evalResult && (
        <form onSubmit={(e) => handleSubmitAnswer(e)} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-200">Your Technical Response</label>
              <span className="text-slate-500 font-mono">{answerText.length} characters</span>
            </div>
            <textarea
              rows={8}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Type your structured answer here. Include relevant technical terminology, core concepts, and code architecture principles..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
            ></textarea>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => handleSubmitAnswer(null, "I don't know")}
              disabled={submitting}
              className="px-4 py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" /> I Don't Know / Skip
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Answer with AI Engine...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submit Answer for AI Evaluation
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default TextInterviewPage;
