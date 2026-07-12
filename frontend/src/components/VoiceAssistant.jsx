import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Volume2, VolumeX, Play, Pause, SkipForward, X, Sparkles
} from 'lucide-react';

function VoiceAssistant({ report, isOpen, onClose, t }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused]     = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [supported, setSupported]   = useState(true);
  const utteranceRef = useRef(null);

  const lines = report ? buildLines(report) : [];

  useEffect(() => {
    if (!window.speechSynthesis) { setSupported(false); }
    return () => window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    if (!isOpen) { window.speechSynthesis?.cancel(); setIsSpeaking(false); setIsPaused(false); setCurrentLine(0); }
  }, [isOpen]);

  function buildLines(r) {
    const score = r.health_score ?? 'N/A';
    const abnormal = r.biomarkers?.filter(b => b.status !== 'Normal') ?? [];
    const rec = r.recommendations?.lifestyle?.[0] ?? r.recommendations?.diet?.[0] ?? 'Maintain a healthy lifestyle.';
    const lines = [
      `Hello! Here is your AI-powered medical report summary for ${r.filename ?? 'your report'}.`,
      `Your overall health score is ${score} out of 100.`,
      abnormal.length === 0
        ? `Great news! All ${r.biomarkers?.length ?? 0} biomarkers are within normal range.`
        : `${abnormal.length} biomarker${abnormal.length > 1 ? 's are' : ' is'} outside the normal range: ${abnormal.slice(0, 3).map(b => b.name).join(', ')}${abnormal.length > 3 ? ', and more.' : '.'}`,
      `AI recommendation: ${rec}`,
      r.fraud_detection?.risk_level === 'High'
        ? `Warning: This report has been flagged with a high fraud risk score of ${r.fraud_detection.fraud_score}%.`
        : `Fraud check passed. No suspicious patterns were detected in this report.`,
      `End of report summary. Please consult a qualified healthcare professional for medical advice.`
    ];
    return lines;
  }

  function speak(startFrom = 0) {
    window.speechSynthesis.cancel();
    setCurrentLine(startFrom);
    let index = startFrom;

    function speakNext() {
      if (index >= lines.length) { setIsSpeaking(false); setCurrentLine(0); return; }
      const utter = new SpeechSynthesisUtterance(lines[index]);
      utter.rate = 0.95;
      utter.pitch = 1.0;
      utter.lang = 'en-US';
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'));
      if (preferred) utter.voice = preferred;
      utter.onstart  = () => setCurrentLine(index);
      utter.onend    = () => { index++; speakNext(); };
      utter.onerror  = () => { setIsSpeaking(false); };
      utteranceRef.current = utter;
      window.speechSynthesis.speak(utter);
    }
    setIsSpeaking(true);
    setIsPaused(false);
    speakNext();
  }

  function toggle() {
    if (!isSpeaking) { speak(); return; }
    if (isPaused) { window.speechSynthesis.resume(); setIsPaused(false); }
    else { window.speechSynthesis.pause(); setIsPaused(true); }
  }

  function stop() { window.speechSynthesis.cancel(); setIsSpeaking(false); setIsPaused(false); setCurrentLine(0); }
  function skip() { window.speechSynthesis.cancel(); const next = currentLine + 1; if (next < lines.length) speak(next); else stop(); }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4 pb-4 sm:pb-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
              <Volume2 size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide">{t('voice_title') || 'Clinical Audio Narrator'}</h3>
              <p className="text-white/80 text-[10px] uppercase tracking-widest font-extrabold">{t('voice_subtitle') || 'AI Summary Voice Assistant'}</p>
            </div>
          </div>
          <button onClick={() => { stop(); onClose(); }} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {!supported && (
            <p className="text-rose-600 text-xs font-bold text-center bg-rose-50 dark:bg-rose-950/30 p-3 rounded-2xl border border-rose-100 dark:border-rose-900/20">
              {t('voice_unsupported') || 'Your browser does not support Speech Synthesis API.'}
            </p>
          )}

          {/* Lines scripts */}
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {lines.map((line, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-2xl text-xs transition-all duration-300 border ${
                  i === currentLine && isSpeaking
                    ? 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold scale-[1.01]'
                    : i < currentLine
                    ? 'bg-slate-50 dark:bg-slate-900/30 border-transparent text-slate-400 dark:text-slate-600 line-through'
                    : 'bg-slate-50 dark:bg-slate-900/30 border-transparent text-slate-600 dark:text-slate-400'
                }`}
              >
                <span className="mr-2 text-[9px] font-extrabold text-slate-400">{i + 1}.</span>
                {line}
              </div>
            ))}
          </div>

          {/* Premium Animated Waveform */}
          {isSpeaking && !isPaused && (
            <div className="flex items-center justify-center space-x-1.5 h-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-850 p-2">
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className="w-[3px] bg-gradient-to-t from-blue-600 to-indigo-500 rounded-full waveform-bar"
                  style={{ 
                    height: `${Math.random() * 24 + 4}px`, 
                    animationDelay: `${i * 0.05}s`,
                    animationDuration: `${Math.random() * 0.5 + 0.6}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Control Actions */}
          <div className="flex items-center justify-center space-x-4 pt-2">
            <button
              onClick={stop}
              disabled={!isSpeaking}
              className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-355 disabled:opacity-40 transition-all border border-transparent dark:border-slate-700/50"
            >
              <VolumeX size={18} />
            </button>

            <button
              onClick={toggle}
              disabled={!supported}
              className="p-5 rounded-3xl bg-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-40 shadow-blue-500/10"
            >
              {isSpeaking && !isPaused ? <Pause size={24} /> : <Play size={24} />}
            </button>

            <button
              onClick={skip}
              disabled={!isSpeaking}
              className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-355 disabled:opacity-40 transition-all border border-transparent dark:border-slate-700/50"
            >
              <SkipForward size={18} />
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
            {isSpeaking ? (isPaused ? '⏸ Narration Paused' : `▶ Narrating item ${currentLine + 1} of ${lines.length}`) : 'Press ▶ to read report summaries aloud'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default VoiceAssistant;
