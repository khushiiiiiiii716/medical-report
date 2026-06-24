import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Sparkles, FileText, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

function ReportUpload({ onUploadSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, scanning, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const [progressMsg, setProgressMsg] = useState('');
  
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const fileType = selectedFile.type;
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    
    if (validTypes.includes(fileType) || selectedFile.name.endsWith('.pdf')) {
      setFile(selectedFile);
      setStatus('idle');
      setErrorMsg('');
    } else {
      setErrorMsg('Unsupported format. Please upload PDF, PNG, JPG, or JPEG.');
      setFile(null);
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) return;

    setStatus('uploading');
    setProgressMsg('Uploading document to secure server...');

    const formData = new FormData();
    formData.append('file', file);

    // Simulate progressive scanner messages
    const statusIntervals = [
      { delay: 1500, msg: "Initializing Optical Character Recognition (OCR)..." },
      { delay: 3500, msg: "Extracting biological health values from text blocks..." },
      { delay: 5500, msg: "Parsing diagnostic reference metrics..." },
      { delay: 7500, msg: "Executing AI models for disease risk probabilities..." }
    ];

    statusIntervals.forEach(item => {
      setTimeout(() => {
        if (status !== 'success' && status !== 'error') {
          setProgressMsg(item.msg);
        }
      }, item.delay);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setStatus('success');
        setTimeout(() => {
          onUploadSuccess(data);
          resetUploader();
          setIsOpen(false);
        }, 1000);
      } else {
        const errData = await response.json();
        setStatus('error');
        setErrorMsg(errData.error || 'Server processing error.');
      }
    } catch (e) {
      console.error(e);
      setStatus('error');
      setErrorMsg('Network error. Ensure the backend server is running on port 5000.');
    }
  };

  const resetUploader = () => {
    setFile(null);
    setStatus('idle');
    setErrorMsg('');
    setProgressMsg('');
    setDragActive(false);
  };

  return (
    <>
      {/* Launch Upload Button */}
      <button
        onClick={() => {
          resetUploader();
          setIsOpen(true);
        }}
        className="flex items-center space-x-2 bg-gradient-to-r from-neonCyan to-neonTeal text-darkBg px-4 py-2.5 rounded-xl font-bold hover:opacity-90 hover:shadow-glow-cyan transition-all text-xs uppercase tracking-wider"
      >
        <Upload size={14} className="stroke-[2.5]" />
        <span>Analyze Report</span>
      </button>

      {/* Upload Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-darkBg/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-lg glass-panel rounded-2xl border border-darkCardBorder shadow-2xl p-6 overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-darkCardBorder">
              <div className="flex items-center space-x-2 text-neonCyan">
                <Sparkles size={18} />
                <h3 className="font-extrabold text-base uppercase tracking-wider text-white">
                  Upload Lab Report
                </h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
                disabled={status === 'uploading'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drag & Drop Area */}
            {status === 'idle' && (
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                  dragActive 
                    ? 'border-neonCyan bg-neonCyan/5' 
                    : 'border-darkCardBorder hover:border-slate-500 hover:bg-white/5'
                }`}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept=".pdf,image/png,image/jpeg,image/jpg,image/webp" 
                  onChange={handleChange}
                />
                
                <div className="p-4 bg-white/5 rounded-full text-slate-400 mb-4 border border-white/5">
                  <Upload size={32} />
                </div>
                
                <p className="text-sm font-bold text-slate-200 mb-1">
                  Drag and drop your report here
                </p>
                <p className="text-xs text-slate-400">
                  Supports PDF, PNG, JPG, JPEG (Max 16MB)
                </p>
              </div>
            )}

            {/* File Selected Preview */}
            {file && status === 'idle' && (
              <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <FileText className="text-neonCyan shrink-0" size={24} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate max-w-[280px]">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button 
                  onClick={resetUploader}
                  className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="mt-4 p-4 bg-neonCritical/10 border border-neonCritical/20 rounded-xl flex items-start space-x-3 text-neonCritical">
                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                <p className="text-xs font-medium leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {/* Scan Progress Bar / Scanning State */}
            {status === 'uploading' && (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="relative w-44 h-44 border border-white/5 bg-[#0B0F19] rounded-xl overflow-hidden mb-6 flex flex-col items-center justify-center">
                  {/* Glowing Laser Scan Bar */}
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neonCyan to-transparent scanner-line"></div>
                  
                  {/* File Mock Graphic */}
                  <FileText size={48} className="text-neonCyan/30 animate-pulse" />
                  <p className="text-[10px] font-bold text-neonCyan tracking-widest mt-2 uppercase">Scanning</p>
                </div>
                
                <div className="flex items-center justify-center space-x-2 text-sm text-slate-300">
                  <Loader2 size={16} className="animate-spin text-neonCyan" />
                  <span className="font-semibold">{progressMsg}</span>
                </div>
              </div>
            )}

            {/* Success Animation */}
            {status === 'success' && (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-neonTeal/15 text-neonTeal rounded-full mb-4 border border-neonTeal/20 shadow-glow-teal animate-bounce">
                  <Sparkles size={36} />
                </div>
                <p className="text-sm font-bold text-white mb-1">
                  Report Processed Successfully!
                </p>
                <p className="text-xs text-slate-400">
                  Synchronizing health markers...
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {status === 'idle' && (
              <div className="mt-6 flex justify-end space-x-3 border-t border-darkCardBorder pt-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadSubmit}
                  disabled={!file}
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    file 
                      ? 'bg-gradient-to-r from-neonCyan to-neonTeal text-darkBg' 
                      : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                  }`}
                >
                  Start Analysis
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
