import React, { useState, useEffect } from 'react';
import { placementDriveService } from '../../services/placementDriveService';
import { companyService } from '../../services/companyService';
import { jobRoleService } from '../../services/jobRoleService';
import { 
  Building2, 
  Briefcase, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Play, 
  Send, 
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

function MockPlacementDrivePage() {
  const [companies, setCompanies] = useState([]);
  const [roles, setRoles] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const [jobRoleId, setJobRoleId] = useState('');
  
  const [activeDriveId, setActiveDriveId] = useState(null);
  const [currentRoundData, setCurrentRoundData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [codeAnswer, setCodeAnswer] = useState('public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{0, 1};\n    }\n}');
  const [textAnswer, setTextAnswer] = useState('');
  
  const [roundResult, setRoundResult] = useState(null);
  const [finalReport, setFinalReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleStartDrive = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFinalReport(null);
    setRoundResult(null);

    try {
      const drive = await placementDriveService.createDrive({
        companyId: companyId ? parseInt(companyId) : null,
        jobRoleId: jobRoleId ? parseInt(jobRoleId) : null
      });
      setActiveDriveId(drive.driveId);
      loadCurrentRound(drive.driveId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initialize mock placement drive');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentRound = async (driveId) => {
    setLoading(true);
    setAnswers({});
    setTextAnswer('');
    try {
      const roundData = await placementDriveService.getCurrentRound(driveId);
      if (roundData.isCompleted || roundData.driveStatus === 'COMPLETED' || roundData.driveStatus === 'FAILED') {
        loadDriveReport(driveId);
      } else {
        setCurrentRoundData(roundData);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch active placement round');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRound = async (e) => {
    e.preventDefault();
    if (!activeDriveId || loading) return;

    setLoading(true);
    setError(null);

    try {
      let payload = {};
      const rNum = currentRoundData?.roundNumber;
      if (rNum === 1 || rNum === 2) {
        payload = { answers };
      } else if (rNum === 3) {
        payload = { code: codeAnswer, problemId: 1 };
      } else {
        payload = { answerText };
      }

      const res = await placementDriveService.submitRound(activeDriveId, payload);
      setRoundResult(res);

      if (res.driveStatus === 'COMPLETED' || res.driveStatus === 'FAILED') {
        loadDriveReport(activeDriveId);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit placement round');
    } finally {
      setLoading(false);
    }
  };

  const handleNextRoundTransition = () => {
    setRoundResult(null);
    if (activeDriveId) {
      loadCurrentRound(activeDriveId);
    }
  };

  const loadDriveReport = async (driveId) => {
    try {
      const report = await placementDriveService.getDriveReport(driveId);
      setFinalReport(report);
      setCurrentRoundData(null);
    } catch (err) {
      setError('Failed to load placement drive final report');
    }
  };

  const roundNames = ['Aptitude', 'Technical MCQ', 'Coding', 'Technical Interview', 'HR Interview'];

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
          <Layers className="w-3.5 h-3.5" /> 5-Round Campus Placement Simulation
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Full Mock Placement Drive</h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Experience a complete end-to-end campus drive featuring Aptitude, Technical MCQs, Coding, Tech Interview, and HR STAR Interview.
        </p>
      </div>

      {error && (
        <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-4 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Setup Configurator if no active drive */}
      {!activeDriveId && !finalReport && (
        <form onSubmit={handleStartDrive} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h3 className="font-bold text-white text-base">Initialize Target Placement Drive</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" /> Target Company
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">General Enterprise (Default)</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.industry})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-400" /> Target Job Role Title
              </label>
              <select
                value={jobRoleId}
                onChange={(e) => setJobRoleId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Software Development Engineer (Default)</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs transition-all shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Initializing Placement Drive...' : 'Start 5-Round Mock Placement Drive'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Stepper Header during active drive */}
      {currentRoundData && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300">
                {currentRoundData.companyName} &bull; {currentRoundData.roleTitle}
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold">
                ROUND {currentRoundData.roundNumber} OF 5
              </span>
            </div>

            {/* Stepper Dots */}
            <div className="grid grid-cols-5 gap-2">
              {roundNames.map((rName, idx) => {
                const stepNum = idx + 1;
                const isCurrent = currentRoundData.roundNumber === stepNum;
                const isPast = currentRoundData.roundNumber > stepNum;
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-center text-xs transition-all ${
                      isCurrent
                        ? 'bg-emerald-600/20 border-emerald-500 text-white font-bold'
                        : isPast
                        ? 'bg-slate-950 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="block text-[10px] uppercase">R{stepNum}</span>
                    <span className="hidden sm:block text-[11px] truncate">{rName}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Round Workspace */}
          {!roundResult && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-emerald-400 uppercase">ACTIVE ROUND</span>
                <h2 className="text-lg font-bold text-white mt-1">{currentRoundData.roundType}</h2>
              </div>

              {/* R1 & R2: Aptitude & Technical MCQs */}
              {(currentRoundData.roundNumber === 1 || currentRoundData.roundNumber === 2) && (
                <div className="space-y-6">
                  {Array.isArray(currentRoundData.content) && currentRoundData.content.map((q, idx) => (
                    <div key={q.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                      <p className="text-xs font-bold text-white">Q{idx + 1}: {q.questionText}</p>
                      <div className="space-y-2">
                        {q.options?.map((opt, optIdx) => {
                          const keys = ['A', 'B', 'C', 'D'];
                          const key = keys[optIdx];
                          const isSel = answers[q.id] === key;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => setAnswers(prev => ({ ...prev, [q.id]: key }))}
                              className={`w-full p-3 rounded-lg border text-xs text-left transition-all cursor-pointer ${
                                isSel ? 'bg-emerald-600/20 border-emerald-500 text-white font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                              }`}
                            >
                              <span className="font-bold text-emerald-400 mr-2">({key})</span> {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* R3: Coding */}
              {currentRoundData.roundNumber === 3 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 block">Java Solution Editor</span>
                  <textarea
                    rows={10}
                    value={codeAnswer}
                    onChange={(e) => setCodeAnswer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 leading-relaxed"
                  ></textarea>
                </div>
              )}

              {/* R4 & R5: Interviews */}
              {(currentRoundData.roundNumber === 4 || currentRoundData.roundNumber === 5) && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1">
                    <span className="font-bold text-emerald-400">QUESTION</span>
                    <p className="text-white text-sm font-bold">"{currentRoundData.content?.questionText}"</p>
                  </div>
                  <textarea
                    rows={6}
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Type your response here..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                  ></textarea>
                </div>
              )}

              <button
                onClick={handleSubmitRound}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Round Submission...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Round Response
                  </>
                )}
              </button>
            </div>
          )}

          {/* Round Qualification Result Overlay */}
          {roundResult && (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" /> Round {roundResult.roundNumber} Feedback: {roundResult.roundType}
                </h3>
                <span className="text-xl font-extrabold text-emerald-400">{roundResult.score}% Score</span>
              </div>

              <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                {roundResult.isQualified ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                )}
                <div>
                  <span className="font-bold text-white text-xs block">
                    {roundResult.isQualified ? 'Qualified for Next Round!' : 'Placement Drive Terminated'}
                  </span>
                  <p className="text-[11px] text-slate-400">{roundResult.message || 'You met the required qualification threshold.'}</p>
                </div>
              </div>

              {roundResult.isQualified && roundResult.driveStatus === 'IN_PROGRESS' && (
                <button
                  onClick={handleNextRoundTransition}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  Proceed to Round {roundResult.nextRoundNumber} <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Final Comprehensive Placement Readiness Report */}
      {finalReport && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded font-bold text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                CAMPUS PLACEMENT VERDICT
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                {finalReport.companyName} &bull; {finalReport.roleTitle}
              </h2>
            </div>

            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{finalReport.finalScore}%</span>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">OVERALL READINESS SCORE</span>
            </div>
          </div>

          {/* Rounds Score Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase">5-Round Score Breakdown</h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {finalReport.rounds?.map((r, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                  <span className="text-slate-500 text-[10px] font-bold block uppercase">R{r.roundNumber} &bull; {r.roundType}</span>
                  <span className="text-lg font-bold text-emerald-400">{r.score}%</span>
                  <span className={`block text-[10px] font-bold ${r.status === 'PASSED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Public Simulation Disclaimer Notice */}
          <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-4 text-amber-300 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Simulated Mock Placement Disclaimer</span>
              <p>{finalReport.disclaimer}</p>
            </div>
          </div>

          <button
            onClick={() => { setActiveDriveId(null); setFinalReport(null); setCurrentRoundData(null); }}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs transition-all shadow-xl cursor-pointer"
          >
            Start New Mock Placement Drive Session
          </button>
        </div>
      )}
    </div>
  );
}

export default MockPlacementDrivePage;
