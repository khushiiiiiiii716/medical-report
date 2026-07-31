import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Upload, X, Loader2, Sparkles, FileText, AlertCircle,
  CheckCircle2, FileScan, ImageIcon,
  CloudUpload, Zap, Shield, Brain
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const ACCEPTED = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

function fileSizeFmt(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const FEATURES = [
  { icon: Brain,  label: 'AI Analysis',     cls: 'bg-blue-50/90 text-blue-700 border-blue-100/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40' },
  { icon: Shield, label: 'Fraud Detection', cls: 'bg-sky-50/90 text-sky-700 border-sky-100/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/40' },
  { icon: Zap,    label: 'Instant Results', cls: 'bg-cyan-50/90 text-cyan-700 border-cyan-100/80 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/40' },
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

      {/* ═══════════════ MODAL (portaled to body for true viewport centering) ═══════════════ */}
      {isOpen && createPortal(
        <div
          className="upload-modal-backdrop fixed inset-0 z-[9999] flex min-h-[100dvh] items-center justify-center overflow-y-auto p-4 sm:p-6"
          style={{ backgroundColor: 'rgba(2, 8, 23, 0.72)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
          onClick={(e) => { if (e.target === e.currentTarget && status !== 'uploading') { reset(); setIsOpen(false); } }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-modal-title"
        >
          <div
            className="upload-modal-panel relative my-auto flex w-full flex-col overflow-hidden"
            style={{
              maxWidth: 540,
              maxHeight: 'calc(100dvh - 2rem)',
              borderRadius: 24,
            }}
          >
            {/* Accent bar */}
            <div className="h-1 w-full shrink-0 bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-400" />

            {/* Close button */}
            <button
              onClick={() => { if (status !== 'uploading') { reset(); setIsOpen(false); } }}
              disabled={status === 'uploading'}
              className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-400 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-white hover:text-slate-700 disabled:opacity-30 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 pb-2 pt-8 sm:px-8 sm:pt-10">

              {/* ── DROP ZONE (no file) ── */}
              {status === 'idle' && !file && (
                <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
                  {/* Hero icon */}
                  <div
                    className={`upload-icon-float relative mb-6 flex h-28 w-28 items-center justify-center rounded-[22px] transition-all duration-300 ${
                      dragActive
                        ? 'scale-110 bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-2xl shadow-blue-500/35'
                        : 'bg-gradient-to-br from-blue-50 to-sky-100 text-blue-600 shadow-lg shadow-blue-500/10 dark:from-blue-950/50 dark:to-sky-950/30 dark:text-blue-400'
                    }`}
                  >
                    <CloudUpload size={52} strokeWidth={1.4} className={dragActive ? 'animate-bounce' : ''} />
                    <div className="pointer-events-none absolute -inset-3 rounded-[26px] border border-blue-200/40 dark:border-blue-700/30" />
                    <div className="pointer-events-none absolute -inset-6 rounded-[30px] border border-blue-100/30 dark:border-blue-800/20" />
                  </div>

                  {/* Heading & subtitle */}
                  <h3
                    id="upload-modal-title"
                    className="font-display text-[22px] font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-2xl"
                  >
                    {t('upload_title') || 'Upload Medical Report'}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {t('upload_subtitle') || 'Secure AI-powered analysis of your lab results in seconds'}
                  </p>

                  {/* Drop zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`mt-8 w-full cursor-pointer rounded-[22px] border-2 border-dashed transition-all duration-300 ${
                      dragActive
                        ? 'scale-[1.01] border-blue-500 bg-blue-50/80 shadow-inner dark:bg-blue-950/30'
                        : 'border-blue-200/80 bg-white/60 hover:border-blue-400 hover:bg-blue-50/50 dark:border-blue-800/40 dark:bg-white/[0.03] dark:hover:border-blue-500/60'
                    }`}
                    style={{ boxShadow: dragActive ? 'inset 0 2px 16px rgba(37, 99, 235, 0.08)' : '0 4px 24px -8px rgba(37, 99, 235, 0.1)' }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                      onChange={(e) => e.target.files?.[0] && validate(e.target.files[0])}
                    />

                    <div className="flex flex-col items-center gap-6 px-6 py-12 sm:px-8 sm:py-14">
                      <div>
                        <p className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100">
                          {dragActive ? 'Release to upload' : (t('upload_drag') || 'Drag & drop your report here')}
                        </p>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {t('upload_sub') || 'PDF, PNG, JPG, JPEG · Max 16 MB'}
                        </p>
                      </div>

                      <div className="flex w-full max-w-[280px] items-center gap-3">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200 dark:to-white/10" />
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">or</span>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-white/10" />
                      </div>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="inline-flex w-full max-w-[280px] items-center justify-center gap-2.5 rounded-[20px] bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 px-8 py-4 text-[15px] font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40 active:translate-y-0"
                      >
                        <Upload size={18} strokeWidth={2.5} />
                        Browse Files
                      </button>
                    </div>
                  </div>

                  {/* Feature badges */}
                  <div className="mt-8 flex w-full flex-wrap items-center justify-center gap-2.5 sm:flex-nowrap sm:gap-3">
                    {FEATURES.map(({ icon: Icon, label, cls }) => (
                      <span
                        key={label}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] font-bold tracking-wide backdrop-blur-sm transition-transform duration-200 hover:scale-[1.02] ${cls}`}
                      >
                        <Icon size={13} strokeWidth={2.2} />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── FILE SELECTED ── */}
              {status === 'idle' && file && (
                <div className="mx-auto w-full max-w-md space-y-4">
                  <div className="text-center">
                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                      {t('upload_title') || 'Upload Medical Report'}
                    </h3>
                    <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                      {t('upload_ready') || 'Your file is ready for analysis'}
                    </p>
                  </div>

                  <div className="overflow-hidden rounded-[22px] border border-blue-100/80 bg-white/70 shadow-lg shadow-blue-500/5 dark:border-white/10 dark:bg-white/5">
                    {preview && (
                      <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <span className="absolute bottom-3 left-4 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-700">Preview</span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 p-5">
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] ${isPdf ? 'bg-rose-100 text-rose-500 dark:bg-rose-950/40' : 'bg-blue-100 text-blue-500 dark:bg-blue-950/40'}`}>
                        {isPdf ? <FileScan size={28} /> : <ImageIcon size={28} />}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{file.name}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                            <CheckCircle2 size={10} /> Ready for Analysis
                          </span>
                          <span className="text-[11px] text-slate-400">{fileSizeFmt(file.size)}</span>
                          <span className="text-[10px] font-bold uppercase text-slate-400">{file.name.split('.').pop()}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); reset(); }}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 dark:border-white/10 dark:hover:bg-rose-950/30"
                        aria-label="Remove"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full items-center justify-center gap-1.5 border-t border-slate-200/80 py-3 text-xs font-semibold text-slate-500 transition hover:bg-blue-50/60 hover:text-blue-600 dark:border-white/8 dark:hover:bg-blue-950/20"
                    >
                      <Upload size={13} /> Choose a different file
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                      onChange={(e) => e.target.files?.[0] && validate(e.target.files[0])}
                    />
                  </div>
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
              <div className="shrink-0 border-t border-slate-100/80 px-6 py-5 dark:border-white/8 sm:px-8">
                <div className="mx-auto flex w-full max-w-md items-stretch gap-3">
                  <button
                    type="button"
                    onClick={() => { reset(); setIsOpen(false); }}
                    className="flex h-[52px] flex-1 items-center justify-center rounded-[20px] border border-slate-200/90 bg-white/90 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                  >
                    {t('upload_cancel') || 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!file}
                    className={`flex h-[52px] flex-1 items-center justify-center gap-2 rounded-[20px] text-sm font-bold transition-all duration-300 ${
                      file
                        ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 text-white shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40'
                        : 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-white/30'
                    }`}
                  >
                    <Sparkles size={16} />
                    {t('upload_start') || 'Start Analysis'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default ReportUpload;
