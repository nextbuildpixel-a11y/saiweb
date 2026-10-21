import React, { useState, useEffect } from 'react';
import { placementPrepService } from '../../services/placementPrepService';
import { 
  Code2, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Terminal, 
  Cpu, 
  RefreshCw,
  FileCode2
} from 'lucide-react';

function CodingPracticePage() {
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState('');
  const [evalResult, setEvalResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProblems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await placementPrepService.getCodingProblems();
      setProblems(data);
      if (data.length > 0) {
        setSelectedProblem(data[0]);
        setCode(data[0].starterCode || '');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load coding problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, []);

  const handleSelectProblem = (prob) => {
    setSelectedProblem(prob);
    setCode(prob.starterCode || '');
    setEvalResult(null);
  };

  const handleSubmitCode = async (e) => {
    e.preventDefault();
    if (!selectedProblem || submitting) return;

    setSubmitting(true);
    setEvalResult(null);
    setError(null);

    try {
      const result = await placementPrepService.submitCodeSolution(selectedProblem.id, code);
      setEvalResult(result);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to execute code submission');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
          <Code2 className="w-3.5 h-3.5" /> DSA & Technical Coding Workspace
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Java Algorithmic Problem Workspace</h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Solve Data Structures & Algorithms problems with instant Java execution feedback and time/space complexity analysis.
        </p>
      </div>

      {error && (
        <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-4 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3 text-emerald-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <p className="text-xs font-semibold">Loading coding problem catalog...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Problem Catalog Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-bold text-slate-300 block">Select Practice Problem</span>
            <div className="space-y-2">
              {problems.map((prob) => {
                const isSelected = selectedProblem?.id === prob.id;
                return (
                  <button
                    key={prob.id}
                    onClick={() => handleSelectProblem(prob)}
                    className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="px-2 py-0.5 rounded font-bold bg-slate-950 text-emerald-400 border border-emerald-500/20">
                        {prob.topic}
                      </span>
                      <span className="uppercase font-semibold text-slate-500">{prob.difficulty}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{prob.title}</h4>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Workspace */}
          <div className="lg:col-span-8 space-y-4">
            {selectedProblem && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                {/* Problem Statement */}
                <div className="space-y-2 border-b border-slate-800 pb-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-emerald-400 font-bold uppercase">{selectedProblem.topic}</span>
                    <span className="text-slate-500 font-semibold uppercase">{selectedProblem.difficulty}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{selectedProblem.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedProblem.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-slate-400">
                    <div>
                      <span className="text-slate-500 font-bold block text-[10px]">SAMPLE INPUT</span>
                      <span>{selectedProblem.sampleInput}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block text-[10px]">SAMPLE OUTPUT</span>
                      <span>{selectedProblem.sampleOutput}</span>
                    </div>
                  </div>
                </div>

                {/* Java Editor */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-300">
                    <span className="font-bold flex items-center gap-1.5">
                      <FileCode2 className="w-4 h-4 text-emerald-400" /> Java Editor (Solution.java)
                    </span>
                  </div>
                  <textarea
                    rows={12}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 leading-relaxed shadow-inner"
                  ></textarea>
                </div>

                <button
                  onClick={handleSubmitCode}
                  disabled={submitting}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Code Execution...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" /> Run & Submit Solution
                    </>
                  )}
                </button>

                {/* Execution Result Box */}
                {evalResult && (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="flex items-center gap-2 font-bold text-white">
                        <Terminal className="w-4 h-4 text-emerald-400" /> Execution Verdict
                      </span>
                      <span className={`px-2.5 py-0.5 rounded font-bold text-xs ${
                        evalResult.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {evalResult.status}
                      </span>
                    </div>

                    <p className="text-slate-300">{evalResult.feedback}</p>

                    <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-blue-400">
                        <span className="text-slate-500 block text-[10px]">TIME COMPLEXITY</span>
                        <span>{evalResult.timeComplexity}</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-purple-400">
                        <span className="text-slate-500 block text-[10px]">SPACE COMPLEXITY</span>
                        <span>{evalResult.spaceComplexity}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CodingPracticePage;
