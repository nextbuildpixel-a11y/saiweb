import React, { useState, useEffect } from 'react';
import { resumeService } from '../../services/resumeService';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Target, 
  Tag, 
  ArrowLeft, 
  RefreshCw,
  Info
} from 'lucide-react';

function ResumeAnalysisPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const latest = await resumeService.getLatestResume();
      if (latest.hasResume && latest.analysis) {
        setData(latest);
      } else if (latest.hasResume) {
        const analysisData = await resumeService.analyzeResume(latest.id);
        setData({ ...latest, analysis: analysisData });
      } else {
        setData(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve resume ATS analysis report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-slate-400">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold">Running AI ATS Keyword & Formatting Analysis Engine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-950/60 border border-rose-800/80 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xl">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Analysis Error</h2>
        <p className="text-xs text-rose-300">{error}</p>
        <button
          onClick={loadAnalysis}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  if (!data || !data.analysis) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xl">
        <FileText className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-lg font-bold text-white">No Resume Found for Analysis</h2>
        <p className="text-xs text-slate-400">Please upload your PDF or DOCX resume document first.</p>
        <Link
          to="/resume"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors"
        >
          Go to Resume Upload Page
        </Link>
      </div>
    );
  }

  const { analysis } = data;

  return (
    <div className="space-y-8 font-sans">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div>
          <button
            onClick={() => navigate('/resume')}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Resume Hub
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> AI ATS Resume Evaluation Report
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">ATS Analysis: {data.fileName}</h1>
        </div>

        <button
          onClick={loadAnalysis}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-run AI Analysis
        </button>
      </div>

      {/* Mandatory ATS Disclaimer Banner */}
      <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 text-xs text-amber-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block text-amber-200">AI-Based ATS Estimation Notice</strong>
          {analysis.disclaimer || 'This analysis is an AI-based evaluation model designed for placement preparation and resume optimization. It is not a guarantee of any specific corporate ATS software result.'}
        </div>
      </div>

      {/* ATS Score & Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main ATS Score Ring */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:col-span-1 shadow-xl flex flex-col justify-between items-center text-center space-y-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall ATS Match Score</span>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                className="text-slate-800 stroke-current"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-500 stroke-current transition-all duration-1000"
                strokeDasharray={`${analysis.atsScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-white">{analysis.atsScore}</span>
              <span className="text-[10px] text-slate-400 uppercase">out of 100</span>
            </div>
          </div>

          <div className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            HIGHLY COMPATIBLE FOR TECH ROLES
          </div>
        </div>

        {/* Breakdown Progress Metrics */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:col-span-2 shadow-xl space-y-4 flex flex-col justify-between">
          <h3 className="font-bold text-white text-sm border-b border-slate-800/80 pb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" /> ATS Component Breakdown
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Skills Match</span>
                <span className="font-bold text-blue-400">{analysis.skillsMatchPercentage}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: `${analysis.skillsMatchPercentage}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Formatting Quality</span>
                <span className="font-bold text-emerald-400">{analysis.formattingScore}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${analysis.formattingScore}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Keyword Coverage</span>
                <span className="font-bold text-purple-400">{analysis.keywordScore}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full" style={{ width: `${analysis.keywordScore}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Project Relevance</span>
                <span className="font-bold text-cyan-400">{analysis.projectRelevanceScore}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full" style={{ width: `${analysis.projectRelevanceScore}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Identified Skills & Missing Keywords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identified Skills Tags */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Tag className="w-4 h-4 text-emerald-400" /> Extracted Resume Skills ({analysis.identifiedSkills?.length || 0})
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.identifiedSkills?.map((skill, idx) => (
              <span key={idx} className="px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-full text-xs font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Keywords Badges */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Recommended Keywords to Add
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.missingKeywords?.map((kw, idx) => (
              <span key={idx} className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full text-xs font-medium">
                + {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths, Weaknesses, and Actionable Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
          <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Detected Strengths
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {analysis.strengths?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">&bull;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
          <h4 className="font-bold text-rose-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <XCircle className="w-4 h-4" /> Detected Weaknesses
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {analysis.weaknesses?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">&bull;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
          <h4 className="font-bold text-blue-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Improvement Suggestions
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {analysis.suggestions?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-400 font-bold">&bull;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ResumeAnalysisPage;
