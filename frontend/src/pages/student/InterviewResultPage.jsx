import React, { useState, useEffect } from 'react';
import { interviewService } from '../../services/interviewService';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Award, 
  CheckCircle2, 
  FileText, 
  Building2, 
  Briefcase, 
  ArrowLeft, 
  PlayCircle, 
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

function InterviewResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      try {
        const data = await interviewService.getInterviewResult(id);
        setResult(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to retrieve interview results');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-blue-400">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold">Generating Final Placement Evaluation Report...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-6 text-rose-300 text-xs space-y-3 max-w-xl mx-auto my-12">
        <div className="flex items-center gap-2 text-rose-200 font-bold text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400" /> Result Retrieval Exception
        </div>
        <p>{error}</p>
        <Link to="/dashboard" className="text-xs text-blue-400 hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Candidate Dashboard
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> Placement Evaluation Report Completed
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {result.companyName} &bull; {result.roleTitle}
          </h1>
        </div>

        <button
          onClick={() => navigate('/interview/setup')}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <PlayCircle className="w-4 h-4" /> Start Another Mock Session
        </button>
      </div>

      {/* Score Summary Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-blue-600/10 border-4 border-blue-500 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold text-white">{result.finalScore}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">out of 100</span>
          </div>

          <div className="space-y-1">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${
              result.finalScore === 0 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
              result.finalScore < 60 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
              'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            }`}>
              {result.finalScore === 0 ? 'NOT PLACEMENT READY (0%)' :
               result.finalScore < 60 ? 'NEEDS SUBSTANTIAL PREPARATION' :
               'RECOMMENDED FOR CAMPUS INTERVIEWS'}
            </span>
            <h3 className="text-base font-extrabold text-white">
              {result.finalScore === 0 ? 'Overall Performance: No Valid Responses Recorded' :
               result.finalScore < 60 ? 'Overall Performance: Below Placement Cutoff' :
               'Overall Performance: High Proficiency'}
            </h3>
            <p className="text-xs text-slate-400">
              Mode: {result.mode} Interview &bull; Answered Questions: {result.questions?.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Question-by-Question Evaluation Breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Question Evaluation Breakdown</h3>
        
        <div className="space-y-4">
          {result.questions?.map((q, idx) => (
            <div key={q.questionId || idx} className={`bg-slate-900/80 border ${q.overallScore === 0 ? 'border-rose-900/40' : 'border-slate-800'} rounded-2xl p-6 space-y-4 shadow-xl`}>
              <div className="flex justify-between items-start border-b border-slate-800/80 pb-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-blue-400 uppercase">Question {idx + 1} &bull; {q.category}</span>
                  <h4 className="text-sm font-bold text-white">"{q.questionText}"</h4>
                </div>
                <span className={`text-lg font-extrabold bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 ${
                  q.overallScore === 0 ? 'text-rose-400' :
                  q.overallScore < 60 ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>
                  {q.overallScore}%
                </span>
              </div>

              {/* Student Answer */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 text-xs font-mono text-slate-300">
                <span className="text-slate-500 font-bold block mb-1 font-sans">Your Submitted Response:</span>
                "{q.answerText || 'No answer submitted.'}"
              </div>

              {q.overallScore === 0 && (
                <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-3.5 text-xs text-rose-300">
                  <span className="font-bold text-rose-400 block mb-1">0% Score Breakdown:</span>
                  {q.evalDetails?.weaknesses?.[0] || 'No credit awarded for this question (answer was blank, candidate stated lack of knowledge, or text was unrelated to topic).'}
                </div>
              )}

              {/* Strengths & Suggestions */}
              {q.evalDetails && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {q.evalDetails.strengths && q.evalDetails.strengths.length > 0 && (
                    <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3.5 space-y-1">
                      <span className="font-bold text-emerald-400 block">Identified Strengths:</span>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        {q.evalDetails.strengths.map((str, i) => <li key={i}>{str}</li>)}
                      </ul>
                    </div>
                  )}

                  {q.evalDetails.suggestions && q.evalDetails.suggestions.length > 0 && (
                    <div className="bg-blue-950/20 border border-blue-900/40 rounded-xl p-3.5 space-y-1">
                      <span className="font-bold text-blue-400 block">Improvement Focus:</span>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        {q.evalDetails.suggestions.map((sug, i) => <li key={i}>{sug}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InterviewResultPage;
