import React, { useState, useEffect } from 'react';
import { jobDescriptionService } from '../../services/jobDescriptionService';
import { 
  FileCheck, 
  Sparkles, 
  Building2, 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle, 
  Target, 
  Tag, 
  History, 
  RefreshCw, 
  Upload,
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';

function JobDescriptionPage() {
  const [roleTitle, setRoleTitle] = useState('Software Development Engineer');
  const [companyName, setCompanyName] = useState('Amazon');
  const [descriptionText, setDescriptionText] = useState(`Job Title: Software Development Engineer (SDE-1)
Company: Amazon
Requirements:
- Strong core Java, Data Structures and Algorithms (DSA) problem solving
- Relational database knowledge (SQL, MySQL, DBMS)
- Experience with Spring Boot REST microservices and Object Oriented Design
- Understanding of Docker, Cloud deployment (AWS), and CI/CD pipelines
- Strong communication and analytical problem-solving skills`);
  
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  const loadHistory = async () => {
    try {
      const historyData = await jobDescriptionService.getJobDescriptionHistory();
      setHistory(historyData);
    } catch (err) {
      console.error('Failed to load JD history', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!descriptionText.trim()) {
      setError('Please paste the Job Description text or upload a JD document.');
      return;
    }

    setAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('roleTitle', roleTitle);
    formData.append('companyName', companyName);
    formData.append('descriptionText', descriptionText);

    try {
      const result = await jobDescriptionService.analyzeJobDescription(formData);
      setAnalysis(result);
      await loadHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze Job Description');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleViewHistoryItem = async (id) => {
    try {
      const item = await jobDescriptionService.getJobDescriptionById(id);
      if (item.analysis) {
        setAnalysis(item.analysis);
        setRoleTitle(item.roleTitle || '');
        setCompanyName(item.companyName || '');
        if (item.descriptionText) setDescriptionText(item.descriptionText);
      }
    } catch (err) {
      setError('Failed to fetch historical JD comparison item');
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
            <FileCheck className="w-3.5 h-3.5" /> Job Description ATS Matcher
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Job Description & Skill Gap Analyzer</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Compare target Job Descriptions against your active resume to discover skill gaps, priority keywords, and role match percentage.
          </p>
        </div>
      </div>

      {/* Input Form & Match Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Briefcase className="w-4 h-4 text-blue-400" /> Target Job Role & Description Input
          </h3>

          {error && (
            <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-3 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Target Company</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Amazon, Google, TCS"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Job Role Title</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Software Engineer, Java Developer"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Paste Job Description Text</label>
            <textarea
              rows={7}
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              placeholder="Paste full Job Description responsibilities and requirements here..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={analyzing}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-semibold text-xs transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Comparing Resume vs JD...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Run AI Resume vs JD Comparison
              </>
            )}
          </button>
        </form>

        {/* Match Percentage & Analysis Card */}
        {analysis ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">{analysis.roleTitle}</h3>
                <span className="text-xs text-slate-400">{analysis.companyName}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block uppercase font-semibold">Skill Match</span>
                <span className="text-2xl font-extrabold text-emerald-400">{analysis.matchPercentage}%</span>
              </div>
            </div>

            {/* Matching vs Missing Skills */}
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Matching Skills ({analysis.matchingSkills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.matchingSkills?.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded text-[11px] font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="w-4 h-4" /> Missing Keywords / Skill Gaps ({analysis.missingSkills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.missingSkills?.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded text-[11px] font-medium">
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Priority Recommendations */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> High-Priority Action Plan
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {analysis.recommendations?.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">&bull;</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3 text-slate-500 shadow-xl">
            <Target className="w-12 h-12 text-slate-600" />
            <h4 className="text-sm font-bold text-slate-300">No Active Comparison Analysis</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Fill in the job role title and description on the left to run an automated AI resume skill gap analysis.
            </p>
          </div>
        )}
      </div>

      {/* Historical JD Analysis Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-purple-400" /> Job Description Comparison History
          </h3>
          <span className="text-xs text-slate-400">Total Analyzed: {history.length}</span>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 font-semibold">Target Company & Role</th>
                  <th className="p-3 font-semibold">Match Score</th>
                  <th className="p-3 font-semibold">Analyzed Date</th>
                  <th className="p-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-semibold text-slate-200">
                      <div>{item.companyName}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{item.roleTitle}</div>
                    </td>
                    <td className="p-3 font-bold text-emerald-400">{item.matchPercentage}%</td>
                    <td className="p-3 text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleViewHistoryItem(item.id)}
                        className="text-blue-400 hover:underline font-semibold cursor-pointer"
                      >
                        View Matrix &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-4">No past JD analyses found.</p>
        )}
      </div>
    </div>
  );
}

export default JobDescriptionPage;
