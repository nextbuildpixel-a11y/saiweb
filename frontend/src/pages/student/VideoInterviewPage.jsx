import React, { useState, useEffect, useRef } from 'react';
import { interviewService } from '../../services/interviewService';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Play, 
  RotateCcw, 
  Send, 
  ArrowRight, 
  Building2, 
  Briefcase, 
  Sparkles, 
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

function VideoInterviewPage() {
  const { id } = useParams();
  const [questionData, setQuestionData] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [textFallbackMode, setTextFallbackMode] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const previewVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize WebRTC Camera Stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setCameraPermissionDenied(false);
    } catch (err) {
      console.error('Camera access exception', err);
      setCameraPermissionDenied(true);
      setTextFallbackMode(true);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const loadQuestion = async () => {
    setLoadingQuestion(true);
    setError(null);
    setEvalResult(null);
    setTranscription('');
    setRecordedBlob(null);
    setRecordedVideoUrl(null);
    setIsRecording(false);
    setRecordingDuration(0);

    try {
      const data = await interviewService.getCurrentQuestion(id);
      setQuestionData(data);
    } catch (err) {
      if (err.response?.data?.error?.includes('completed')) {
        navigate(`/interview/result/${id}`);
      } else {
        setError(err.response?.data?.error || 'Failed to load video interview question');
      }
    } finally {
      setLoadingQuestion(false);
    }
  };

  useEffect(() => {
    loadQuestion();
  }, [id]);

  // Recording Timer Effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const startRecording = () => {
    if (!streamRef.current) return;
    recordedChunksRef.current = [];

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm;codecs=vp8,opus' });
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setIsRecording(false);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to initialize MediaRecorder', err);
      setTextFallbackMode(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleRetakeVideo = () => {
    setRecordedBlob(null);
    setRecordedVideoUrl(null);
    setRecordingDuration(0);
    setTranscription('');
  };

  const handleSubmitVideoAnswer = async (e, forcedText) => {
    if (e && e.preventDefault) e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      let uploadedFilePath = null;
      if (recordedBlob) {
        const videoFile = new File([recordedBlob], `answer_video_${Date.now()}.webm`, { type: 'video/webm' });
        const uploadRes = await interviewService.uploadVideoFile(videoFile);
        uploadedFilePath = uploadRes.videoFilePath;
      }

      const answerText = forcedText !== undefined ? forcedText : (transcription.trim() || 'No video answer recorded');

      const result = await interviewService.submitAnswer(id, {
        answerText,
        answerType: 'VIDEO',
        speakingDuration: recordingDuration,
        videoFilePath: uploadedFilePath
      });

      setEvalResult(result);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit video answer');
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
    if (window.confirm('Are you sure you want to end this video interview session?')) {
      try {
        await interviewService.completeInterview(id);
        navigate(`/interview/result/${id}`);
      } catch (err) {
        navigate(`/interview/result/${id}`);
      }
    }
  };

  if (loadingQuestion) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-rose-400">
        <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold">Initializing WebRTC Camera Feed & AI Question...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-6 text-rose-300 text-xs space-y-3 max-w-xl mx-auto my-12">
        <div className="flex items-center gap-2 text-rose-200 font-bold text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400" /> Video Interview Exception
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
      {/* Workspace Header */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-blue-400" /> {questionData?.companyName}</span>
              &bull;
              <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-purple-400" /> {questionData?.roleTitle}</span>
              &bull;
              <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded font-bold">VIDEO MODE</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Question {questionData?.questionOrder} of {questionData?.totalQuestions}
            </h2>
          </div>

          <div className="flex items-center gap-3">
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
            className="bg-gradient-to-r from-rose-500 to-indigo-500 h-full transition-all duration-500"
            style={{ width: `${(questionData?.questionOrder / questionData?.totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Permission Denied Notice */}
      {cameraPermissionDenied && (
        <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-4 text-amber-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Camera / Microphone Permission Notice</span>
            <p>Camera permission was denied. You can provide your answer text in the editor below to continue your evaluation.</p>
          </div>
        </div>
      )}

      {/* Current Question Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
        <div className="flex justify-between items-center text-xs">
          <span className="px-2.5 py-0.5 rounded font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            EVALUATED SKILL: {questionData?.skill}
          </span>
          <span className="text-slate-500 uppercase font-semibold">Difficulty: {questionData?.difficulty}</span>
        </div>
        <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
          "{questionData?.questionText}"
        </p>
      </div>

      {/* WebRTC Video Recording Workspace */}
      {!evalResult && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Camera Viewport */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Live WebRTC Camera Feed</span>
              <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 aspect-video flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                ></video>
                {isRecording && (
                  <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 bg-rose-600/90 text-white rounded-full text-xs font-mono font-bold animate-pulse shadow-lg">
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                    REC {recordingDuration}s
                  </div>
                )}
              </div>
            </div>

            {/* Recorded Video Playback Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Recorded Video Preview</span>
              <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 aspect-video flex items-center justify-center text-slate-600 text-xs">
                {recordedVideoUrl ? (
                  <video
                    ref={previewVideoRef}
                    src={recordedVideoUrl}
                    controls
                    className="w-full h-full object-cover"
                  ></video>
                ) : (
                  <div className="text-center space-y-1">
                    <Video className="w-8 h-8 mx-auto text-slate-700" />
                    <span>No recording captured yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 border-t border-slate-800 pt-4">
            {!recordedBlob ? (
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-xl flex items-center gap-2 cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white'
                }`}
              >
                <Video className="w-4 h-4" />
                {isRecording ? `Stop Recording (${recordingDuration}s)` : 'Start Video Recording'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRetakeVideo}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Retake Video
              </button>
            )}
          </div>

          {/* Optional Transcript Notes */}
          <div className="space-y-2 border-t border-slate-800 pt-4">
            <label className="text-xs font-bold text-slate-300 block">Technical Notes / Answer Summary (Optional)</label>
            <textarea
              rows={3}
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              placeholder="Add key code points or summary points for your video response..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
            ></textarea>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => handleSubmitVideoAnswer(null, "I don't know")}
              disabled={submitting}
              className="px-4 py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" /> I Don't Know / Skip
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmitVideoAnswer(e)}
              disabled={submitting}
              className="flex-1 py-3.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all shadow-xl shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Uploading Video & Evaluating with AI Engine...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Confirm & Submit Video Response
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* AI Evaluation Overlay Modal */}
      {evalResult && (
        <div className={`bg-slate-900 border ${evalResult.overallScore === 0 ? 'border-rose-500/50' : 'border-rose-500/40'} rounded-2xl p-6 space-y-4 shadow-2xl animate-fade-in`}>
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" /> AI Video Evaluation Feedback
            </h3>
            <span className={`text-xl font-extrabold ${evalResult.overallScore === 0 ? 'text-rose-400' : evalResult.overallScore < 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {evalResult.overallScore}% Overall Score
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-center">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <span className="text-slate-400 block text-[11px]">Technical Score</span>
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
                {evalResult.evaluation?.weaknesses?.[0] || '0% assigned: No video answer recorded, candidate indicated lack of knowledge, or response was unrelated.'}
              </p>
            </div>
          )}

          <button
            onClick={handleNextQuestion}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            {evalResult.isFinished ? 'View Final Video Placement Report' : 'Proceed to Next Video Question'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default VideoInterviewPage;
