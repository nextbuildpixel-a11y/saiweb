import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewService } from '../../services/interviewService';
import { History, Award, Play, Eye, Clock, Building2, Briefcase, RefreshCw } from 'lucide-react';

function InterviewHistoryPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await interviewService.getInterviewHistory();
        setInterviews(data);
      } catch (err) {
        setError('Failed to load interview history');
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 text-xs gap-2 font-sans">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" /> Loading Interview History...
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-1">
          <History className="w-3.5 h-3.5" /> Practice Records & Archives
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Interview History & Detailed Reports</h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Review all past text, voice, and video mock interview sessions, complete with AI evaluations and question breakdowns.
        </p>
      </div>

      {error && (
        <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-4 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {interviews.length === 0 ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xl">
          <History className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-white font-bold text-base">No Past Interviews Recorded</h3>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            You haven't completed any mock interviews yet. Start your first session to build performance records.
          </p>
          <button
            onClick={() => navigate('/interview/setup')}
            className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer"
          >
            Start Mock Interview
          </button>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-sm">Past Interview Sessions ({interviews.length})</h3>
          <div className="space-y-3">
            {interviews.map((item) => (
              <div key={item.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:border-slate-700">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{item.companyName || 'Enterprise Mock'}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-800 text-slate-400">
                      {item.roleTitle || 'Software Engineer'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {item.mode || 'TEXT'} MODE
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 text-xs">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-500" /> {item.startedAt ? new Date(item.startedAt).toLocaleDateString() : 'Recent'}</span>
                    <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-purple-400" /> {item.interviewType}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xl font-extrabold ${(item.overallScore ?? 0) === 0 ? 'text-rose-400' : (item.overallScore ?? 0) < 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {item.overallScore ?? 0}%
                  </span>
                  <button
                    onClick={() => navigate(`/interview/result/${item.id}`)}
                    className="py-2 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-400" /> View Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewHistoryPage;
