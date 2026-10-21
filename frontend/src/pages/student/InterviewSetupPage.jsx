import React, { useState, useEffect } from 'react';
import { interviewService } from '../../services/interviewService';
import { companyService } from '../../services/companyService';
import { jobRoleService } from '../../services/jobRoleService';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircle, 
  Building2, 
  Briefcase, 
  Target, 
  HelpCircle, 
  Mic, 
  FileText,
  Video,
  Zap,
  ArrowRight
} from 'lucide-react';

function InterviewSetupPage() {
  const [companies, setCompanies] = useState([]);
  const [roles, setRoles] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const [jobRoleId, setJobRoleId] = useState('');
  const [mode, setMode] = useState('Text'); // Text, Voice, or Video
  const [interviewType, setInterviewType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [compData, roleData] = await Promise.all([
          companyService.getCompanies(),
          jobRoleService.getJobRoles()
        ]);
        setCompanies(compData);
        setRoles(roleData);
        if (compData.length > 0) setCompanyId(compData[0].id);
        if (roleData.length > 0) setJobRoleId(roleData[0].id);
      } catch (err) {
        console.error('Failed to load setup catalogs', err);
      }
    };
    loadCatalogs();
  }, []);

  const handleStartInterview = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await interviewService.createInterview({
        companyId: companyId ? parseInt(companyId) : null,
        jobRoleId: jobRoleId ? parseInt(jobRoleId) : null,
        mode,
        interviewType,
        difficulty,
        totalQuestions: parseInt(totalQuestions)
      });

      if (mode === 'Voice') {
        navigate(`/interview/voice/${result.interviewId}`);
      } else if (mode === 'Video') {
        navigate(`/interview/video/${result.interviewId}`);
      } else {
        navigate(`/interview/text/${result.interviewId}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initialize interview session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-1">
          <PlayCircle className="w-3.5 h-3.5" /> AI Mock Interview Configurator
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Setup Mock Placement Interview</h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Customize target company, role, interview mode (Text/Voice/Video), difficulty, and question count.
        </p>
      </div>

      {error && (
        <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-4 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Configurator Form */}
      <form onSubmit={handleStartInterview} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Workspace Mode Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-200 block">Select Interview Workspace Mode</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setMode('Text')}
              className={`p-4 rounded-xl border flex items-center justify-center gap-3 font-bold text-xs transition-all cursor-pointer ${
                mode === 'Text'
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className={`w-5 h-5 ${mode === 'Text' ? 'text-blue-400' : 'text-slate-500'}`} />
              <div className="text-left">
                <span className="block">Text Mode</span>
                <span className="text-[10px] text-slate-500 font-normal">Type answer text</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('Voice')}
              className={`p-4 rounded-xl border flex items-center justify-center gap-3 font-bold text-xs transition-all cursor-pointer ${
                mode === 'Voice'
                  ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Mic className={`w-5 h-5 ${mode === 'Voice' ? 'text-purple-400' : 'text-slate-500'}`} />
              <div className="text-left">
                <span className="block">Voice Mode</span>
                <span className="text-[10px] text-slate-500 font-normal">STT & Speech TTS</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('Video')}
              className={`p-4 rounded-xl border flex items-center justify-center gap-3 font-bold text-xs transition-all cursor-pointer ${
                mode === 'Video'
                  ? 'bg-rose-600/20 border-rose-500 text-white shadow-lg shadow-rose-500/10'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Video className={`w-5 h-5 ${mode === 'Video' ? 'text-rose-400' : 'text-slate-500'}`} />
              <div className="text-left">
                <span className="block">Video Mode</span>
                <span className="text-[10px] text-slate-500 font-normal">WebRTC Video & Recording</span>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Target Company */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" /> Target Enterprise / Company
            </label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">General Practice (No Specific Enterprise)</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.industry})</option>
              ))}
            </select>
          </div>

          {/* Target Role */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-400" /> Target Job Role Title
            </label>
            <select
              value={jobRoleId}
              onChange={(e) => setJobRoleId(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Software Engineer (Default)</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>

          {/* Interview Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" /> Interview Category Type
            </label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Technical">Technical (Core Tech & Coding)</option>
              <option value="Behavioral">Behavioral (STAR Method & Situational)</option>
              <option value="HR">HR & Cultural Fit</option>
            </select>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Target Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="EASY">EASY (Foundational Concepts)</option>
              <option value="MEDIUM">MEDIUM (Standard Campus Drive Level)</option>
              <option value="HARD">HARD (Product Enterprise Challenge)</option>
            </select>
          </div>
        </div>

        {/* Number of Questions Selector */}
        <div className="space-y-2 border-t border-slate-800/80 pt-4">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-cyan-400" /> Number of Evaluation Questions
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[3, 5, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setTotalQuestions(num)}
                className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  totalQuestions === num
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-md shadow-blue-500/10'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {num} Questions ({num * 5} Mins)
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs transition-all shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? 'Initializing AI Session...' : `Launch ${mode} Interview Workspace`} <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default InterviewSetupPage;
