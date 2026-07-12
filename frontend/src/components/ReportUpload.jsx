import React, { useState } from 'react';
import { Upload, X, Loader2, Sparkles, FileText, AlertCircle, BrainCircuit, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function ReportUpload({ onUploadSuccess, t }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const fileInputRef = React.useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
  };

  const validateAndSetFile = (selectedFile) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.pdf')) {
      setFile(selectedFile);
      setStatus('idle');
      setErrorMsg('');
    } else {
      setErrorMsg(t('upload_error_format') || 'Unsupported format. Please upload PDF, PNG, JPG, or JPEG.');
      setFile(null);
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) return;
    setStatus('uploading');
    setActiveStep(0);

    const formData = new FormData();
    formData.append('file', file);

    [
      { delay: 1500, step: 1 },
      { delay: 3500, step: 2 },
      { delay: 5500, step: 3 },
    ].forEach((item) => {
      setTimeout(() => {
        setActiveStep((prev) => (status !== 'success' && status !== 'error' ? item.step : prev));
      }, item.delay);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: formData });
      if (response.ok) {
        const data = await response.json();
        setActiveStep(4);
        setStatus('success');
        setTimeout(() => {
          onUploadSuccess(data);
          resetUploader();
          setIsOpen(false);
        }, 1200);
      } else {
        const errData = await response.json();
        setStatus('error');
        setErrorMsg(errData.error || 'Server error while parsing document.');
      }
    } catch {
      setStatus('error');
      setErrorMsg(t('upload_error_network') || 'Connection error. Ensure backend is running.');
    }
  };

  const resetUploader = () => {
    setFile(null);
    setStatus('idle');
    setErrorMsg('');
    setDragActive(false);
    setActiveStep(0);
  };

  const steps = [
    t('upload_scanning') || 'Secure file upload',
    t('upload_ocr') || 'OCR diagnostic extraction',
    t('upload_extract') || 'Isolating biological variables',
    t('upload_parse') || 'AI risk assessment models',
  ];

  return (
    <>
      <button onClick={() => { resetUploader(); setIsOpen(true); }} className="btn-primary px-4 py-2.5 text-xs uppercase tracking-wider">
        <Upload size={14} />
        <span className="hidden sm:inline">{t('btn_analyze') || 'Analyze Report'}</span>
        <span className="sm:hidden">Upload</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true" aria-label="Upload report">
          <div className="relative w-full max-w-xl animate-scale-in overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white/95 p-6 shadow-soft-lg backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1729]/95">
            <div className="mb-5 flex items-center justify-between border-b border-slate-200/60 pb-4 dark:border-white/8">
              <div>
                <div className="mb-1 flex items-center gap-2 section-label text-blue-600">
                  <BrainCircuit size={16} />
                  {t('upload_title') || 'Upload Lab Report'}
                </div>
                <div className="font-display text-xl font-bold text-slate-900 dark:text-white">Secure report intake</div>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10" disabled={status === 'uploading'} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {status === 'idle' && (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50/60 scale-[1.01] dark:bg-blue-950/20'
                    : 'border-slate-200 bg-slate-50/60 hover:border-blue-400 hover:bg-blue-50/30 dark:border-white/10 dark:bg-white/3'
                }`}
              >
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])} />
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-glow-cyan">
                  <Upload size={28} />
                </div>
                <div className="font-display text-lg font-bold text-slate-900 dark:text-white">{t('upload_drag') || 'Drag and drop your report here'}</div>
                <div className="mt-2 text-sm text-slate-500">{t('upload_sub') || 'Supports PDF, PNG, JPG, JPEG (Max 16MB)'}</div>
              </div>
            )}

            {file && status === 'idle' && (
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 dark:border-white/8 dark:bg-white/5">
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="shrink-0 text-blue-500" size={24} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); resetUploader(); }} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10" aria-label="Remove file">
                  <X size={14} />
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400" role="alert">
                <AlertCircle className="mt-0.5 shrink-0" size={16} />
                <p>{errorMsg}</p>
              </div>
            )}

            {status === 'uploading' && (
              <div className="space-y-6 py-4">
                <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-50/80 dark:border-white/8 dark:bg-white/3">
                  <div className="scanner-line absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                  <FileText size={44} className="text-blue-500/25 animate-pulse-soft" />
                  <span className="absolute bottom-3 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">Scanning document</span>
                </div>

                <div className="mx-auto max-w-sm space-y-3">
                  {steps.map((label, i) => {
                    const isDone = activeStep > i;
                    const isActive = activeStep === i;
                    return (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold transition-all duration-300 ${
                          isDone ? 'border-emerald-500 bg-emerald-500 text-white' :
                          isActive ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/40' :
                          'border-slate-200 text-slate-400 dark:border-white/10'
                        }`}>
                          {isDone ? '✓' : i + 1}
                        </div>
                        <span className={`font-medium transition-colors ${isDone ? 'text-slate-400 line-through' : isActive ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                          {label}
                        </span>
                        {isActive && <Loader2 size={12} className="ml-auto animate-spin text-blue-500" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center py-10 text-center animate-scale-in">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 size={32} />
                </div>
                <p className="font-display text-lg font-bold text-slate-900 dark:text-white">{t('upload_success') || 'Report analyzed successfully!'}</p>
                <p className="mt-1 text-sm text-slate-500">{t('upload_syncing') || 'Rendering diagnostics dashboard…'}</p>
              </div>
            )}

            {status === 'idle' && (
              <div className="mt-6 flex justify-end gap-3 border-t border-slate-200/60 pt-4 dark:border-white/8">
                <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-800">
                  {t('upload_cancel') || 'Cancel'}
                </button>
                <button onClick={handleUploadSubmit} disabled={!file} className="btn-primary px-5 py-2.5 text-xs uppercase tracking-wider disabled:opacity-50">
                  {t('upload_start') || 'Start Analysis'}
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
