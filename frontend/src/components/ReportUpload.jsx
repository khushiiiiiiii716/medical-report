import React, { useState, useRef, useCallback } from 'react';
import {
  Upload, X, Loader2, Sparkles, FileText, AlertCircle,
  BrainCircuit, CheckCircle2, FileScan, ImageIcon,
  CloudUpload, Zap, Shield, Brain, Lock
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const ACCEPTED = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

function fileSizeFmt(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const FEATURES = [
  { icon: <Brain size={11} />,  label: 'AI Analysis',      cls: 'bg-blue-50   text-blue-600   border border-blue-100'   },
  { icon: <Shield size={11} />, label: 'Fraud Detection',  cls: 'bg-violet-50 text-violet-600 border border-violet-100' },
  { icon: <Zap size={11} />,    label: 'Instant Results',  cls: 'bg-amber-50  text-amber-600  border border-amber-100'  },
  { icon: <Lock size={11} />,   label: 'Secure & Private', cls: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
];

function getSteps(t) {
  return [
    { label: t('upload_scanning') || 'Uploading to secure server',   icon: <CloudUpload size={13} /> },
    { label: t('upload_ocr')      || 'Optical character recognition', icon: <FileScan size={13} />   },
    { label: t('upload_extract')  || 'Extracting biological values',  icon: <Sparkles size={13} />   },
    { label: t('upload_parse')    || 'Running AI risk models',        icon: <Brain size={13} />       },
  ];
}

function ReportUpload({ onUploadSuccess, t }) {
  const [isOpen,     setIsOpen]     = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [file,       setFile]       = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [status,     setStatus]     = useState('idle');
  const [errorMsg,   setErrorMsg]   = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [progress,   setProgress]   = useState(0);
  const fileInputRef = useRef(null);
  const progressRef  = useRef(null);

  const validate = useCallback((f) => {
    if (!f) return;
    if (ACCEPTED.includes(f.type) || f.name.toLowerCase().endsWith('.pdf')) {
      setFile(f); setErrorMsg('');
      if (f.type.startsWith('image/')) {
        const r = new FileReader();
        r.onload = (e) => setPreview(e.target.result);
        r.readAsDataURL(f);
      } else { setPreview(null); }
    } else {
      setErrorMsg(t('upload_error_format') || 'Unsupported format. Please upload PDF, PNG, JPG or JPEG.');
      setFile(null); setPreview(null);
    }
  }, [t]);

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false); validate(e.dataTransfer.files?.[0]);
  };

  const reset = () => {
    setFile(null); setPreview(null); setStatus('idle');
    setErrorMsg(''); setActiveStep(0); setProgress(0);
    clearInterval(progressRef.current);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setStatus('uploading'); setActiveStep(0); setProgress(0);
    let p = 0;
    progressRef.current = setInterval(() => {
      p = Math.min(p + Math.random() * 3, 88);
      setProgress(Math.round(p));
    }, 300);
    const timers = [
      setTimeout(() => setActiveStep(1), 1600),
      setTimeout(() => setActiveStep(2), 3400),
      setTimeout(() => setActiveStep(3), 5200),
    ];
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: fd });
      timers.forEach(clearTimeout); clearInterval(progressRef.current);
      if (res.ok) {
        const data = await res.json();
        setActiveStep(4); setProgress(100); setStatus('success');
        setTimeout(() => { onUploadSuccess(data); reset(); setIsOpen(false); }, 1600);
      } else {
        const err = await res.json();
        setStatus('error'); setErrorMsg(err.error || 'Server error.'); setProgress(0);
      }
    } catch {
      timers.forEach(clearTimeout); clearInterval(progressRef.current);
      setStatus('error');
      setErrorMsg(t('upload_error_network') || 'Connection error. Ensure backend is running.');
      setProgress(0);
    }
  };

  const steps = getSteps(t);
  const isPdf = file?.type === 'application/pdf';

  return (
    <>
      {/* Trigger button */}
      <button onClick={() => { reset(); setIsOpen(true); }} className="btn-primary px-4 py-2.5 text-xs uppercase tracking-wider">
        <Upload size={14} />
        <span className="hidden sm:inline">{t('btn_analyze') || 'Analyze Report'}</span>
        <span className="sm:hidden">Upload</span>
      </button>

      {/* ═══════════════ MODAL ═══════════════ */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
          style={{ backgroundColor: 'rgba(2,8,23,0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          onClick={(e) => { if (e.target === e.currentTarget && status !== 'uploading') { reset(); setIsOpen(false); } }}
          role="dialog" aria-modal="true"
        >
          <div
            className="relative flex w-full flex-col bg-white dark:bg-[#0c1628] overflow-hidden"
            style={{
              maxWidth: 480,
              maxHeight: 'calc(100dvh - 2rem)',
              borderRadius: 24,
              boxShadow: '0 0 0 1px rgba(148,163,184,0.15), 0 40px 80px -20px rgba(0,0,0,0.5)',
            }}
          >
            {/* Top colour bar */}
            <div className="h-1 w-full shrink-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-violet-500" />

            {/* Header */}
            <div className="shrink-0 flex items-center justify-between gap-3 px-6 pt-5 pb-4 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30">
                  <BrainCircuit size={18} />
                </div>
                <div>
                  <h3 className="font-display text-[15px] font-bold leading-tight text-slate-900 dark:text-white">
                    {t('upload_title') || 'Upload Lab Report'}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">AI-powered clinical analysis</p>
                </div>
              </div>
              <button
                onClick={() => { if (status !== 'uploading') { reset(); setIsOpen(false); } }}
                disabled={status === 'uploading'}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">

              {/* ── DROP ZONE (no file) ── */}
              {status === 'idle' && !file && (
                <div
                  onDragEnter={handleDrag} onDragOver={handleDrag}
                  onDragLeave={handleDrag} onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-200 ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-[1.01]'
                      : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/60 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-blue-500'
                  }`}
                >
                  <input
                    ref={fileInputRef} type="file" className="hidden"
                    accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => e.target.files?.[0] && validate(e.target.files[0])}
                  />

                  <div className="flex flex-col items-center gap-5 px-6 py-10 text-center">

                    {/* Cloud icon */}
                    <div className={`relative flex h-24 w-24 items-center justify-center rounded-3xl transition-all duration-300 ${
                      dragActive
                        ? 'bg-blue-500 text-white shadow-2xl shadow-blue-500/40 scale-110'
                        : 'bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600 dark:from-blue-900/60 dark:to-cyan-900/40 dark:text-blue-400'
                    }`}>
                      <CloudUpload size={44} strokeWidth={1.5} className={dragActive ? 'animate-bounce' : ''} />
                      <div className="absolute -inset-2 rounded-full border-2 border-blue-200/50 dark:border-blue-700/40" />
                      <div className="absolute -inset-5 rounded-full border border-blue-100/40 dark:border-blue-800/30" />
                    </div>

                    {/* Heading */}
                    <div>
                      <p className="font-display text-[18px] font-bold text-slate-900 dark:text-white">
                        {dragActive ? '📂 Release to upload' : (t('upload_drag') || 'Drag & drop your report')}
                      </p>
                      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {t('upload_sub') || 'PDF, PNG, JPG, JPEG · Max 16 MB'}
                      </p>
                    </div>

                    {/* OR divider */}
                    <div className="flex w-full items-center gap-3">
                      <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">or</span>
                      <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                    </div>

                    {/* Browse Files button */}
                    <div className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5">
                      <Upload size={15} />
                      Browse Files
                    </div>

                    {/* Feature badges */}
                    <div className="flex flex-wrap justify-center gap-2">
                      {FEATURES.map((f) => (
                        <span key={f.label} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold ${f.cls}`}>
                          {f.icon}{f.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── FILE SELECTED ── */}
              {status === 'idle' && file && (
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                  {preview && (
                    <div className="relative h-36 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                      <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className="absolute bottom-3 left-4 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold text-slate-700">Preview</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 p-5">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${isPdf ? 'bg-rose-100 text-rose-500 dark:bg-rose-950/40' : 'bg-blue-100 text-blue-500 dark:bg-blue-950/40'}`}>
                      {isPdf ? <FileScan size={28} /> : <ImageIcon size={28} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{file.name}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          <CheckCircle2 size={9} /> Ready for Analysis
                        </span>
                        <span className="text-[10px] text-slate-400">{fileSizeFmt(file.size)}</span>
                        <span className="text-[10px] font-bold uppercase text-slate-400">{file.name.split('.').pop()}</span>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); reset(); }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30"
                      aria-label="Remove">
                      <X size={15} />
                    </button>
                  </div>
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-1.5 border-t border-slate-200 py-2.5 text-[11px] font-semibold text-slate-400 transition hover:bg-blue-50 hover:text-blue-500 dark:border-white/8 dark:hover:bg-blue-950/20">
                    <Upload size={11} /> Choose a different file
                  </button>
                  <input ref={fileInputRef} type="file" className="hidden"
                    accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => e.target.files?.[0] && validate(e.target.files[0])} />
                </div>
              )}

              {/* ── ERROR ── */}
              {errorMsg && (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/30 dark:bg-rose-950/20" role="alert">
                  <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-500" />
                  <p className="text-xs text-rose-600 dark:text-rose-400">{errorMsg}</p>
                </div>
              )}

              {/* ── UPLOADING ── */}
              {status === 'uploading' && (
                <div className="space-y-4">
                  <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 dark:border-blue-900/30 dark:from-blue-950/20 dark:to-cyan-950/10">
                    <div className="scanner-line absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                    <div className="flex flex-col items-center gap-2">
                      <FileText size={36} className="animate-pulse text-blue-400/50" />
                      <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Analysing with AI…</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-slate-500">Progress</span>
                      <span className="tabular-nums text-blue-600">{progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {steps.map((step, i) => {
                      const done = activeStep > i, active = activeStep === i;
                      return (
                        <div key={i} className={`flex items-center gap-3 rounded-2xl border px-4 py-2.5 transition-all duration-300 ${
                          done   ? 'border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-950/20'
                                 : active ? 'border-blue-200 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-950/30'
                                          : 'border-slate-100 bg-slate-50/40 opacity-50 dark:border-white/5'
                        }`}>
                          <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            done ? 'bg-emerald-500 text-white' : active ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-400 dark:bg-white/10'
                          }`}>
                            {done ? '✓' : active ? <Loader2 size={11} className="animate-spin" /> : i + 1}
                          </div>
                          <span className={`text-xs font-medium ${done ? 'text-emerald-700 line-through dark:text-emerald-400' : active ? 'font-bold text-blue-700 dark:text-blue-400' : 'text-slate-400'}`}>
                            {active && <span className="mr-1 text-blue-500">{step.icon}</span>}
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── SUCCESS ── */}
              {status === 'success' && (
                <div className="flex flex-col items-center gap-5 py-10 text-center">
                  <div className="relative flex h-24 w-24 items-center justify-center">
                    <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-xl shadow-emerald-500/40">
                      <CheckCircle2 size={36} />
                    </div>
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold text-slate-900 dark:text-white">{t('upload_success') || 'Report Analysed Successfully!'}</p>
                    <p className="mt-1.5 text-xs text-slate-400">{t('upload_syncing') || 'Loading your diagnostics dashboard…'}</p>
                  </div>
                </div>
              )}

            </div>

            {/* ── FOOTER ── */}
            {status === 'idle' && (
              <div className="shrink-0 flex items-stretch gap-3 border-t border-slate-100 px-6 py-5 dark:border-white/8">
                <button
                  onClick={() => { reset(); setIsOpen(false); }}
                  className="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white py-3 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  {t('upload_cancel') || 'Cancel'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!file}
                  className={`flex flex-[2] items-center justify-center gap-2 rounded-2xl py-3 text-[13px] font-bold text-white transition-all duration-200 ${
                    file
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40'
                      : 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-white/10 dark:text-white/30'
                  }`}
                >
                  <Sparkles size={15} />
                  {t('upload_start') || 'Start AI Analysis'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}

export default ReportUpload;
