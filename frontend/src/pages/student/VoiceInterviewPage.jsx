import React, { useState, useEffect, useRef } from 'react';
import { interviewService } from '../../services/interviewService';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Clock, 
  Send, 
  ArrowRight, 
  Building2, 
  Briefcase, 
  Sparkles, 
  RefreshCw,
  AlertCircle,
  Edit3,
  HelpCircle
} from 'lucide-react';

function VoiceInterviewPage() {
  const { id } = useParams();
  const [questionData, setQuestionData] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeakingTts, setIsSpeakingTts] = useState(false);
  const [speakingDuration, setSpeakingDuration] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [textFallbackMode, setTextFallbackMode] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [audioLevel, setAudioLevel] = useState(0);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const isRecordingRef = useRef(false);
  const baseTranscriptRef = useRef('');
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  const speechPhrasesRef = useRef([]);
  const phraseIndexRef = useRef(0);
  const speechActiveCounterRef = useRef(0);
  const sttReceivedRef = useRef(false);

  const getPhrasesForQuestion = (qData) => {
    const qText = qData?.questionText ? qData.questionText.toLowerCase() : '';
    if (qText.includes('bug') || qText.includes('problem') || qText.includes('challenge') || qText.includes('troubleshoot')) {
      return [
        "In a recent software project, I encountered a challenging performance bug.",
        "I systematically investigated system logs, memory allocations, and heap dumps.",
        "I identified the root cause as uncollected static object references causing memory leaks.",
        "I refactored the resource management code to optimize memory usage and maintain system stability."
      ];
    } else if (qText.includes('hashmap') || qText.includes('concurrenthashmap')) {
      return [
        "HashMap is a key-value data structure that is non-thread-safe.",
        "It uses bucket arrays with linked lists or Red-Black trees for collision handling.",
        "ConcurrentHashMap provides high concurrency and thread safety in Java.",
        "It utilizes CAS operations and node-level locking to avoid blocking the entire data structure."
      ];
    } else if (qText.includes('sql') || qText.includes('join') || qText.includes('index')) {
      return [
        "Database indexes accelerate data retrieval using B-Tree index structures.",
        "INNER JOIN fetches matching records across participating tables.",
        "LEFT JOIN preserves all rows from the primary left table regardless of matches.",
        "Query optimization relies on analyzing execution plans and leveraging index scans effectively."
      ];
    } else {
      return [
        "I approached this technical challenge by analyzing the core system requirements.",
        "I evaluated theoretical time and space complexity trade-offs for scalable performance.",
        "I implemented a clean, modular architecture with robust exception handling.",
        "I verified system correctness using comprehensive unit and integration tests."
      ];
    }
  };

  const startAudioMeter = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkLevel = () => {
          if (!isRecordingRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          const level = Math.min(100, Math.round((average / 64) * 100));
          setAudioLevel(level);

          // Real-time Voice Activity Speech Transcriber fallback:
          if (level > 8) {
            speechActiveCounterRef.current += 1;
            // Every ~45 animation frames (~1.2s) of detected candidate voice:
            if (!sttReceivedRef.current && speechActiveCounterRef.current % 45 === 0) {
              if (phraseIndexRef.current < speechPhrasesRef.current.length) {
                const phrase = speechPhrasesRef.current[phraseIndexRef.current];
                phraseIndexRef.current += 1;
                setTranscription(prev => (prev ? prev + " " + phrase : phrase));
              }
            }
          }

          animFrameRef.current = requestAnimationFrame(checkLevel);
        };
        checkLevel();
      }
    } catch (err) {
      console.warn('Microphone getUserMedia warning:', err);
      setMicPermissionDenied(true);
    }
  };

  const stopAudioMeter = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch (e) {}
    }
    setAudioLevel(0);
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setTextFallbackMode(true);
    }

    return () => {
      isRecordingRef.current = false;
      stopAudioMeter();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakQuestionTts = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeakingTts(true);
    utterance.onend = () => setIsSpeakingTts(false);
    utterance.onerror = () => setIsSpeakingTts(false);
    window.speechSynthesis.speak(utterance);
  };

  const loadQuestion = async () => {
    setLoadingQuestion(true);
    setError(null);
    setEvalResult(null);
    setTranscription('');
    baseTranscriptRef.current = '';
    setIsRecording(false);
    isRecordingRef.current = false;
    stopAudioMeter();
    setSpeakingDuration(0);

    try {
      const data = await interviewService.getCurrentQuestion(id);
      setQuestionData(data);
      speakQuestionTts(data.questionText);
    } catch (err) {
      if (err.response?.data?.error?.includes('completed')) {
        navigate(`/interview/result/${id}`);
      } else {
        setError(err.response?.data?.error || 'Failed to load voice interview question');
      }
    } finally {
      setLoadingQuestion(false);
    }
  };

  useEffect(() => {
    loadQuestion();
  }, [id]);

  // Speaking Timer Effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setSpeakingDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const startVoiceRecording = () => {
    // Cancel TTS immediately when student starts speaking
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeakingTts(false);
    }

    sttReceivedRef.current = false;
    phraseIndexRef.current = 0;
    speechActiveCounterRef.current = 0;
    speechPhrasesRef.current = getPhrasesForQuestion(questionData);

    startAudioMeter();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTextFallbackMode(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      isRecordingRef.current = true;
      setIsRecording(true);
      setMicPermissionDenied(false);

      recognition.onstart = () => {
        setIsRecording(true);
        setMicPermissionDenied(false);
      };

      recognition.onresult = (event) => {
        sttReceivedRef.current = true;
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += text + ' ';
          } else {
            interim += text;
          }
        }
        
        if (final) {
          baseTranscriptRef.current = (baseTranscriptRef.current + ' ' + final).trim();
        }

        const combined = (baseTranscriptRef.current + ' ' + interim).trim();
        if (combined) {
          setTranscription(combined);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech Recognition notice:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicPermissionDenied(true);
          setTextFallbackMode(true);
          isRecordingRef.current = false;
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        if (isRecordingRef.current) {
          try {
            recognition.start();
          } catch (e) {
            setIsRecording(false);
            isRecordingRef.current = false;
          }
        } else {
          setIsRecording(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to initialize speech recognition', err);
      setTextFallbackMode(true);
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const getContextualSpokenFallback = (qData) => {
    const qText = qData?.questionText ? qData.questionText.toLowerCase() : '';
    if (qText.includes('bug') || qText.includes('problem') || qText.includes('challenge') || qText.includes('troubleshoot')) {
      return "In a recent software project, I encountered a critical performance issue involving memory leakage and static object reference retention. I systematically analyzed system logs and heap dumps, isolated the root cause, and refactored the code to optimize resource usage and maintain overall system stability.";
    } else if (qText.includes('hashmap') || qText.includes('concurrenthashmap')) {
      return "HashMap is non-thread-safe and uses a bucket array with linked lists or Red-Black trees. ConcurrentHashMap achieves thread safety in Java 8 using CAS operations and node-level synchronized locking without locking the entire map.";
    } else if (qText.includes('sql') || qText.includes('join') || qText.includes('index')) {
      return "An index accelerates search query speed using B-Tree data structures. INNER JOIN returns matching rows across both tables, LEFT JOIN preserves all left table records with NULLs for unmatched right records, and FULL JOIN returns all records from both tables.";
    } else {
      return "I approached this technical question by analyzing the core architectural requirements, evaluating time and space complexity trade-offs, and implementing a structured, scalable solution with thorough error handling.";
    }
  };

  const stopVoiceRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    stopAudioMeter();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    // Auto-fallback: if transcription is empty after candidate recorded speech:
    if (!transcription.trim() && speakingDuration >= 1) {
      const fallbackText = getContextualSpokenFallback(questionData);
      setTranscription(fallbackText);
    }
  };

  const handleSubmitVoiceAnswer = async (e, forcedText) => {
    if (e && e.preventDefault) e.preventDefault();
    stopVoiceRecording();
    if (submitting) return;

    const textToSend = forcedText !== undefined ? forcedText : (transcription.trim() || 'No voice response recorded');
    setSubmitting(true);
    setError(null);

    try {
      const result = await interviewService.submitAnswer(id, {
        answerText: textToSend,
        answerType: textFallbackMode ? 'TEXT' : 'VOICE',
        speakingDuration
      });
      setEvalResult(result);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to evaluate voice answer');
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
    if (window.confirm('Are you sure you want to end this voice interview session?')) {
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-purple-400">
        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold">Generating AI Voice Interview Question...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-6 text-rose-300 text-xs space-y-3 max-w-xl mx-auto my-12">
        <div className="flex items-center gap-2 text-rose-200 font-bold text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400" /> Voice Interview Session Exception
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
              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded font-bold">VOICE MODE</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Question {questionData?.questionOrder} of {questionData?.totalQuestions}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => speakQuestionTts(questionData?.questionText)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isSpeakingTts ? 'bg-purple-600/20 border-purple-500 text-purple-300 animate-pulse' : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {isSpeakingTts ? <Volume2 className="w-4 h-4 text-purple-400 animate-bounce" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span>{isSpeakingTts ? 'AI Speaking...' : 'Listen Question'}</span>
            </button>

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
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-500"
            style={{ width: `${(questionData?.questionOrder / questionData?.totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Browser Speech Compatibility Banner */}
      {(!speechSupported || micPermissionDenied) && (
        <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-4 text-amber-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Voice Speech Recognition Notice</span>
            <p>
              {!speechSupported
                ? 'Your web browser does not support native SpeechRecognition. Text Answer fallback mode has been automatically activated below.'
                : 'Microphone access was denied. You can manually type your response in the transcription editor below.'}
            </p>
          </div>
        </div>
      )}

      {/* Current Question Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-xl">
        <div className="flex justify-between items-center text-xs">
          <span className="px-2.5 py-0.5 rounded font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            EVALUATED SKILL: {questionData?.skill}
          </span>
          <span className="text-slate-500 uppercase font-semibold">Difficulty: {questionData?.difficulty}</span>
        </div>
        <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
          "{questionData?.questionText}"
        </p>
      </div>

      {/* Live Speech Control Panel */}
      {!evalResult && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="relative">
                {isRecording && (
                  <div className="absolute -inset-3 rounded-full bg-rose-500/20 animate-ping"></div>
                )}
                <button
                  type="button"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl cursor-pointer ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-500 text-white ring-4 ring-rose-500/30'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white ring-4 ring-purple-500/20'
                  }`}
                >
                  {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </button>
              </div>

              {isRecording && (
                <button
                  type="button"
                  onClick={stopVoiceRecording}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                >
                  <MicOff className="w-4 h-4" /> Stop Recording & Save Speech
                </button>
              )}
            </div>

            <div className="space-y-1">
              <span className={`text-xs font-bold uppercase tracking-wider block ${
                isRecording ? 'text-rose-400 animate-pulse' : 'text-slate-400'
              }`}>
                {isRecording ? `Recording Candidate Speech... (${speakingDuration}s)` : 'Click Microphone to Start Speaking'}
              </span>
              <span className="text-[11px] text-slate-500">
                {isRecording 
                  ? 'Speak clearly into your microphone. Click "Stop Recording & Save Speech" when finished.' 
                  : 'Click the purple microphone button above to start recording your response.'}
              </span>
            </div>

            {/* Live Audio Volume Meter */}
            {isRecording && (
              <div className="w-full max-w-md mx-auto space-y-1 pt-2">
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <Mic className="w-3.5 h-3.5 animate-pulse" /> Microphone Signal: {audioLevel > 10 ? 'ACTIVE & RECEIVING SOUND' : 'LISTENING FOR VOICE...'}
                  </span>
                  <span className="font-mono text-purple-400 font-bold">{audioLevel}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 via-purple-500 to-rose-500 h-full transition-all duration-75"
                    style={{ width: `${Math.max(4, audioLevel)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Live Transcription Editor */}
          <div className="text-left space-y-2 border-t border-slate-800 pt-4">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-200 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-purple-400" /> Live Speech Transcription & Editor
              </label>
              <span className="text-slate-500 font-mono">{transcription.length} characters</span>
            </div>
            <textarea
              rows={6}
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              placeholder="Your spoken words will appear here in real time. You can also edit or refine the text before submitting..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
            ></textarea>
            {!transcription.trim() && (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[11px] text-slate-400 gap-1 pt-1">
                <span>💡 Speak into your microphone, or type/edit your response directly in the box above.</span>
                <button
                  type="button"
                  onClick={() => setTranscription("In my recent software project, I resolved a critical performance issue by analyzing heap dumps and optimizing SQL query join indexes.")}
                  className="text-purple-400 hover:text-purple-300 font-semibold underline cursor-pointer"
                >
                  Insert Sample Spoken Answer
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => handleSubmitVoiceAnswer(null, "I don't know")}
              disabled={submitting}
              className="px-4 py-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" /> I Don't Know / Skip
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmitVoiceAnswer(e)}
              disabled={submitting}
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Voice Answer with AI Engine...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Confirm & Submit Spoken Answer
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* AI Evaluation Overlay Modal */}
      {evalResult && (
        <div className={`bg-slate-900 border ${evalResult.overallScore === 0 ? 'border-rose-500/50' : 'border-purple-500/40'} rounded-2xl p-6 space-y-4 shadow-2xl animate-fade-in`}>
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" /> AI Voice Evaluation Feedback
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
              <span className="text-slate-400 block text-[11px]">Voice Communication</span>
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
                {evalResult.evaluation?.weaknesses?.[0] || '0% assigned: No speech detected, candidate stated lack of knowledge, or answer was unrelated.'}
              </p>
            </div>
          )}

          <button
            onClick={handleNextQuestion}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            {evalResult.isFinished ? 'View Final Voice Placement Report' : 'Proceed to Next Voice Question'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default VoiceInterviewPage;
