import React, { useState, useEffect } from 'react';
import { resumeService } from '../../services/resumeService';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  History, 
  Eye, 
  FileCheck,
  RefreshCw
} from 'lucide-react';

function ResumePage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [latestResume, setLatestResume] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExtractedText, setShowExtractedText] = useState(false);
  const navigate = useNavigate();

  const loadResumeData = async () => {
    setLoading(true);
    try {
      const [latestRes, historyRes] = await Promise.all([
        resumeService.getLatestResume(),
        resumeService.getResumeHistory()
      ]);
      setLatestResume(latestRes.hasResume ? latestRes : null);
      setHistory(historyRes);
    } catch (err) {
      console.error('Failed to load resume data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumeData();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase();
      if (!fileName.endsWith('.pdf') && !fileName.endsWith('.docx') && !fileName.endsWith('.doc')) {
        setError('Invalid file format. Only PDF and DOCX documents are accepted.');
        setFile(null);
        return;
      }
      if (selectedFile.size > 25 * 1024 * 1024) {
        setError('File size exceeds 25MB limit.');
        setFile(null);
        return;
      }
      setError(null);
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await resumeService.uploadResume(file);
      setMessage(`Resume '${result.fileName}' uploaded and parsed successfully! ATS Score: ${result.atsScore}/100.`);
      setFile(null);
      await loadResumeData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload and parse resume file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
            <FileText className="w-3.5 h-3.5" /> Candidate Resume Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Resume Parser & Upload</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Upload your PDF/DOCX resume for text extraction, skill mining, and AI ATS analysis.
          </p>
        </div>

        {latestResume && (
          <button
            onClick={() => navigate('/resume-analysis')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> View Full ATS Analysis Report <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Alert Messages */}
      {message && (
        <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-xl p-4 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-4 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Upload Box & Latest Resume Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Drop Zone */}
        <form onSubmit={handleUpload} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-400" /> Upload New Resume Document
            </h3>
            <p className="text-slate-400 text-xs">Supports PDF and DOCX files up to 25MB.</p>
          </div>

          <div className="border-2 border-dashed border-slate-800 hover:border-blue-500/60 rounded-xl p-8 text-center transition-colors bg-slate-950/40 relative">
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center space-y-2 pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="text-xs font-semibold text-slate-200">
                {file ? file.name : 'Click to select or drag and drop PDF / DOCX'}
              </div>
              <span className="text-[11px] text-slate-500">Maximum file size: 25MB</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-semibold text-xs transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Extracting Text & Computing ATS...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> Upload & Parse Resume
              </>
            )}
          </button>
        </form>

        {/* Active Resume Details Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" /> Active Profile Resume
            </h3>
            {latestResume && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ATS Score: {latestResume.atsScore}/100
              </span>
            )}
          </div>

          {latestResume ? (
            <div className="space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{latestResume.fileName}</span>
                  <span className="text-slate-500">{new Date(latestResume.uploadedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-3 italic">
                  "{latestResume.extractedText}"
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowExtractedText(!showExtractedText)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> {showExtractedText ? 'Hide Text' : 'View Full Extracted Text'}
                </button>
                <button
                  onClick={() => navigate('/resume-analysis')}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Open ATS Report
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-2 text-slate-500 text-xs">
              <FileText className="w-8 h-8 mx-auto text-slate-600" />
              <p>No active resume uploaded yet. Upload a PDF or DOCX file to get started.</p>
            </div>
          )}

          {showExtractedText && latestResume && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 max-h-48 overflow-y-auto">
              {latestResume.extractedText}
            </div>
          )}
        </div>
      </div>

      {/* Upload History Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-purple-400" /> Resume Upload History
          </h3>
          <span className="text-xs text-slate-400">Total Uploaded: {history.length}</span>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 font-semibold">File Name</th>
                  <th className="p-3 font-semibold">Upload Date</th>
                  <th className="p-3 font-semibold">ATS Rating</th>
                  <th className="p-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-semibold text-slate-200 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" /> {item.fileName}
                    </td>
                    <td className="p-3 text-slate-400">{new Date(item.uploadedAt).toLocaleDateString()}</td>
                    <td className="p-3 font-bold text-emerald-400">{item.atsScore}/100</td>
                    <td className="p-3">
                      <button
                        onClick={() => navigate('/resume-analysis')}
                        className="text-blue-400 hover:underline font-semibold cursor-pointer"
                      >
                        View Analysis &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-4">No upload history available.</p>
        )}
      </div>
    </div>
  );
}

export default ResumePage;
