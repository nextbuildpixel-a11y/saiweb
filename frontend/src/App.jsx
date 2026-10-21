import React, { useState, useEffect } from 'react';
import api from './services/api';
import { Link } from 'react-router-dom';
import { 
  Server, 
  Database, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Zap, 
  Code2, 
  ShieldCheck, 
  Cpu, 
  Globe, 
  Layers,
  Sparkles,
  LogIn,
  Shield
} from 'lucide-react';

function App() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/health');
      setHealthStatus(response.data);
    } catch (err) {
      setError(err.message || 'Failed to connect to Spring Boot Backend API');
      setHealthStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-600">
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full space-y-8">
        {/* Header Section */}
        <header className="border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm tracking-wider uppercase">
              <Sparkles className="w-4 h-4" /> B.Tech Final Year Academic Project
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-blue-400 mt-1">
              AI Mock Interview & Placement Preparation Platform
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1">
              Project Name: <span className="text-blue-400 font-semibold">AI Interview Coach</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <LogIn className="w-4 h-4" /> Student Portal Login
            </Link>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all active:scale-95"
            >
              <Shield className="w-4 h-4 text-purple-400" /> Admin Login
            </Link>
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Integration Online
            </span>
          </div>
        </header>

        {/* System Architecture Tech Stack Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { icon: Code2, label: 'Java 17', sub: 'Spring Boot 3.2' },
            { icon: Database, label: 'MySQL 8.0', sub: 'Spring Data JPA' },
            { icon: Globe, label: 'React 18 SPA', sub: 'Vite + Tailwind' },
            { icon: ShieldCheck, label: 'Spring Security', sub: 'JWT + BCrypt' },
            { icon: Cpu, label: 'External LLM API', sub: 'Java Orchestration' },
            { icon: Layers, label: 'Browser APIs', sub: 'Speech & Media' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col items-start hover:border-slate-700 transition-colors">
              <item.icon className="w-5 h-5 text-blue-400 mb-2" />
              <span className="text-xs font-semibold text-slate-200">{item.label}</span>
              <span className="text-[11px] text-slate-500">{item.sub}</span>
            </div>
          ))}
        </div>

        {/* Live System Integration Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-5">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-400" /> System Integration Status Check
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                Verifying real-time REST communication between React Frontend, Spring Boot Backend, and MySQL Database.
              </p>
            </div>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Testing...' : 'Re-test Endpoints'}
            </button>
          </div>

          {/* Health Status Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Backend Service Status */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-blue-400" /> Backend REST Service
                </span>
                {healthStatus?.status === 'UP' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ONLINE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    <XCircle className="w-3.5 h-3.5" /> OFFLINE
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold text-slate-200">
                {healthStatus ? healthStatus.service : loading ? 'Checking HTTP endpoint...' : 'Disconnected'}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Base: {api.defaults.baseURL}
              </div>
            </div>

            {/* MySQL Database Status */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-cyan-400" /> MySQL Database
                </span>
                {healthStatus?.database === 'CONNECTED' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> CONNECTED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    <XCircle className="w-3.5 h-3.5" /> DISCONNECTED
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold text-slate-200">
                {healthStatus?.databaseCatalog ? `Catalog: ${healthStatus.databaseCatalog}` : loading ? 'Verifying MySQL driver...' : 'No Database Connection'}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Engine: {healthStatus?.databaseProduct || 'MySQL 8.0'}
              </div>
            </div>

            {/* React Frontend Client Status */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-400" /> React 18 Frontend Client
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-200">
                Vite + Axios REST Engine
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Port: 5173 | Environment: Development
              </div>
            </div>
          </div>

          {/* Raw JSON Health Output Response Box */}
          {healthStatus && (
            <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Spring Boot REST Response Payload (`GET /api/health`)</span>
                <span className="font-mono text-[11px] text-emerald-400">HTTP 200 OK</span>
              </div>
              <pre className="text-xs font-mono text-blue-300 bg-slate-900/80 p-3 rounded-lg overflow-x-auto border border-slate-800/50">
                {JSON.stringify(healthStatus, null, 2)}
              </pre>
            </div>
          )}

          {error && (
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 text-rose-300 text-xs flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-rose-200">Connection Failure Notice</strong>
                {error}
                <div className="mt-1 text-[11px] text-rose-400/80">
                  Ensure Spring Boot backend application is running on port 8080 (`mvn spring-boot:run` in `backend/`).
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Phase 1 Verification Summary */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Phase 1 Foundation Checkpoints Completed
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Spring Boot 3.2 Java Backend initialized (`com.aiinterview.coach`)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>React 18 + Vite + Tailwind CSS Single Page Application scaffolded</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>MySQL database connection configured (`ai_mock_interview`)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>CORS & REST API communication verified (`GET /api/health`)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full text-center text-xs text-slate-500 pt-8 border-t border-slate-800/60">
        AI Interview Coach &bull; B.Tech Final Year Academic Project &bull; Java Spring Boot + React + MySQL
      </footer>
    </div>
  );
}

export default App;
