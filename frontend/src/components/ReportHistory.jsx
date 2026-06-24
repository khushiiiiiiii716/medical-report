import React, { useState } from 'react';
import { FileText, Calendar, Trash2, CheckCircle2, ChevronRight, Activity, AlertTriangle } from 'lucide-react';

function ReportHistory({ reports, activeReportIndex, setActiveReportIndex, onDeleteReport }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const getScoreColorClass = (score) => {
    if (score >= 90) return 'text-neonTeal bg-neonTeal/10 border-neonTeal/20';
    if (score >= 75) return 'text-neonCyan bg-neonCyan/10 border-neonCyan/20';
    if (score >= 60) return 'text-neonWarning bg-neonWarning/10 border-neonWarning/20';
    return 'text-neonCritical bg-neonCritical/10 border-neonCritical/20';
  };

  const handleSelect = (idx) => {
    setActiveReportIndex(idx);
  };

  const handleDelete = (id) => {
    onDeleteReport(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Overview Block */}
      <div className="glass-panel p-6 rounded-2xl border border-darkCardBorder flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-wide">
            Your Diagnostics Vault
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Browse, manage, and toggle between your clinical test records. Selecting a report updates the dashboard indicators, risk predictors, and AI recommendation roadmap.
          </p>
        </div>
        <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-xl text-center shrink-0">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Reports</span>
          <span className="text-2xl font-black text-white">{reports.length}</span>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((rep, idx) => {
          const isActive = idx === activeReportIndex;
          const abnormCount = rep.biomarkers.filter(b => b.status !== 'Normal').length;

          return (
            <div 
              key={rep.id} 
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isActive 
                  ? 'bg-gradient-to-r from-neonCyan/10 to-neonIndigo/5 border-neonCyan shadow-glow-cyan' 
                  : 'glass-panel border-darkCardBorder hover:border-slate-600'
              }`}
            >
              
              {/* Report Main Info */}
              <div className="flex items-start space-x-4 min-w-0">
                <div className={`p-3 rounded-xl border shrink-0 ${
                  isActive ? 'bg-neonCyan/15 text-neonCyan border-neonCyan/20' : 'bg-white/5 text-slate-400 border-white/5'
                }`}>
                  <FileText size={24} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-white truncate max-w-[280px]">
                      {rep.filename}
                    </h4>
                    {isActive && (
                      <span className="bg-neonCyan/15 text-neonCyan font-bold text-[9px] px-2 py-0.5 rounded border border-neonCyan/20 uppercase tracking-widest shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Calendar size={11} />
                      <span>{new Date(rep.upload_date).toLocaleDateString()}</span>
                    </span>
                    <span>•</span>
                    <span>{rep.biomarkers.length} parameters analyzed</span>
                    <span>•</span>
                    <span className="text-neonWarning font-semibold">{abnormCount} anomalies</span>
                  </div>
                </div>
              </div>

              {/* Score Badges & Risks Summary */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                
                {/* Health Score Gauge */}
                <div className={`px-3 py-1.5 rounded-lg border text-center shrink-0 ${getScoreColorClass(rep.health_score)}`}>
                  <span className="text-[9px] font-bold block uppercase tracking-wider">Health Score</span>
                  <span className="text-sm font-black">{rep.health_score}/100</span>
                </div>

                {/* Risks list */}
                <div className="text-[10px] text-slate-400 space-y-0.5 font-bold uppercase tracking-wider hidden sm:block">
                  <div>Dia: <span className="text-white">{rep.risks.diabetes}%</span></div>
                  <div>Cardio: <span className="text-white">{rep.risks.heart_disease}%</span></div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pl-2 border-l border-darkCardBorder">
                  {!isActive && (
                    <button
                      onClick={() => handleSelect(idx)}
                      className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider flex items-center space-x-1"
                    >
                      <span>Select</span>
                      <ChevronRight size={14} />
                    </button>
                  )}

                  {confirmDeleteId === rep.id ? (
                    <div className="flex items-center space-x-1.5 animate-fade-in bg-neonCritical/10 border border-neonCritical/15 p-1 rounded-lg">
                      <button
                        onClick={() => handleDelete(rep.id)}
                        className="px-2 py-1 bg-neonCritical text-white rounded text-[10px] font-bold uppercase"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-[10px] font-bold uppercase"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    // We only allow deleting reports if there are more than 1 report
                    reports.length > 1 && (
                      <button
                        onClick={() => setConfirmDeleteId(rep.id)}
                        className="p-2 text-slate-500 hover:text-neonCritical hover:bg-neonCritical/10 rounded-xl transition-all"
                        title="Delete Record"
                      >
                        <Trash2 size={15} />
                      </button>
                    )
                  )}
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

export default ReportHistory;
