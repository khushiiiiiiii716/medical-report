import React, { useState } from 'react';
import { FileText, Calendar, Trash2, ChevronRight, AlertTriangle, ShieldX, ShieldAlert } from 'lucide-react';
import ProgressRing from './ui/ProgressRing';

function ReportHistory({ reports, activeReportIndex, setActiveReportIndex, onDeleteReport, t }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const getScoreColor = (score) => {
    if (score >= 90) return '#10B981';
    if (score >= 75) return '#2563EB';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getFraudBadge = (fraudDetection) => {
    if (!fraudDetection?.risk_level || fraudDetection.risk_level === 'none') return null;
    const map = {
      low: { icon: ShieldAlert, label: 'Low Fraud Risk', cls: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400' },
      medium: { icon: ShieldAlert, label: 'Fraud Suspected', cls: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400' },
      high: { icon: ShieldX, label: 'High Fraud Risk', cls: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400' },
    };
    const cfg = map[fraudDetection.risk_level];
    if (!cfg) return null;
    const Icon = cfg.icon;
    return (
      <span className={`badge border ${cfg.cls}`}>
        <Icon size={10} />
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in-up">
      <div className="soft-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{t('history_title') || 'Your Diagnostics Vault'}</h3>
          <p className="mt-1 max-w-lg text-sm text-slate-500">{t('history_sub') || 'Browse and manage your clinical test records. Selecting a report updates all analytics.'}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/60 bg-slate-50/80 px-6 py-3 text-center dark:border-white/8 dark:bg-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('history_total') || 'Total Reports'}</span>
          <div className="font-display text-3xl font-bold text-slate-900 dark:text-white">{reports.length}</div>
        </div>
      </div>

      <div className="space-y-4">
        {reports.map((rep, idx) => {
          const isActive = idx === activeReportIndex;
          const abnormCount = rep.biomarkers.filter((b) => b.status !== 'Normal').length;

          return (
            <div
              key={rep.id}
              className={`group rounded-3xl border p-5 transition-all duration-300 ${
                isActive
                  ? 'border-blue-500/40 bg-gradient-to-r from-blue-50/60 to-cyan-50/30 shadow-md shadow-blue-500/10 dark:from-blue-950/20 dark:to-cyan-950/10'
                  : 'border-slate-200/60 bg-white/80 hover:border-blue-300/60 hover:shadow-card dark:border-white/8 dark:bg-[#0f1729]/80'
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className={`rounded-2xl border p-3 transition-colors ${isActive ? 'border-blue-500/30 bg-blue-500/10 text-blue-600' : 'border-slate-200/60 bg-slate-50 text-slate-400 dark:border-white/8 dark:bg-white/5'}`}>
                    <FileText size={22} />
                  </div>
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate text-sm font-bold text-slate-900 dark:text-white">{rep.filename}</h4>
                      {rep.is_emergency && (
                        <span className="badge border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/30 dark:bg-rose-950/40 dark:text-rose-400">
                          <AlertTriangle size={10} />
                          {t('alert_emergency_title') || 'Emergency'}
                        </span>
                      )}
                      {getFraudBadge(rep.fraud_detection)}
                      {isActive && (
                        <span className="badge border border-blue-500 bg-blue-500 text-white">{t('active_badge') || 'Active'}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar size={11} />{new Date(rep.upload_date).toLocaleDateString()}</span>
                      <span>{rep.biomarkers.length} {t('history_parameters') || 'parameters'}</span>
                      <span className="font-semibold text-amber-600">{abnormCount} {t('history_anomalies') || 'anomalies'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <ProgressRing value={rep.health_score} size={56} stroke={5} color={getScoreColor(rep.health_score)} />

                  <div className="hidden text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:block">
                    <div>Diabetes: <span className="text-slate-800 dark:text-slate-200">{rep.risks?.diabetes ?? 0}%</span></div>
                    <div>Cardio: <span className="text-slate-800 dark:text-slate-200">{rep.risks?.heart_disease ?? 0}%</span></div>
                  </div>

                  <div className="flex items-center gap-2 border-l border-slate-200/60 pl-3 dark:border-white/8">
                    {!isActive && (
                      <button onClick={() => setActiveReportIndex(idx)} className="btn-secondary text-xs">
                        {t('btn_select') || 'Select'}
                        <ChevronRight size={14} />
                      </button>
                    )}
                    {confirmDeleteId === rep.id ? (
                      <div className="flex items-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 p-1.5 dark:border-rose-900/30 dark:bg-rose-950/20">
                        <button onClick={() => { onDeleteReport(rep.id); setConfirmDeleteId(null); }} className="rounded-xl bg-rose-600 px-2.5 py-1.5 text-[10px] font-bold uppercase text-white hover:bg-rose-700">
                          {t('btn_confirm') || 'Confirm'}
                        </button>
                        <button onClick={() => setConfirmDeleteId(null)} className="rounded-xl bg-slate-200 px-2.5 py-1.5 text-[10px] font-bold uppercase text-slate-700 dark:bg-white/10 dark:text-slate-300">
                          {t('btn_cancel') || 'Cancel'}
                        </button>
                      </div>
                    ) : reports.length > 1 && (
                      <button onClick={() => setConfirmDeleteId(rep.id)} className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20" aria-label="Delete report">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
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
