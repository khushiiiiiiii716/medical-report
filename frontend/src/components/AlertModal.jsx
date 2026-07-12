import React from 'react';
import { AlertTriangle, X, HeartPulse, ArrowRight } from 'lucide-react';

function AlertModal({ isOpen, onClose, criticalBiomarkers, mlAnomalies, emergencyAlert, setActiveTab, t }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in" role="alertdialog" aria-modal="true">
      <div className="w-full max-w-md animate-scale-in overflow-hidden rounded-3xl border border-rose-200/60 bg-white shadow-soft-lg dark:border-rose-900/40 dark:bg-[#0f1729]">
        <div className="bg-gradient-to-r from-rose-500 to-red-600 p-5 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/20 p-2 backdrop-blur">
                <AlertTriangle size={24} className="animate-pulse-soft" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold">{t('alert_modal_title')}</h2>
                <p className="text-xs text-white/80">Immediate attention recommended</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/20" aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {emergencyAlert?.is_emergency && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/30 dark:bg-rose-950/20">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600">
                <HeartPulse size={14} />
                {t('alert_modal_emergency')}
              </p>
              <p className="mt-1 text-xs">
                {t('alert_modal_emergency_details', { criticalCount: emergencyAlert.critical_count, anomalyCount: emergencyAlert.trend_anomaly_count })}
              </p>
            </div>
          )}

          <p>{t('alert_modal_body')}</p>

          {criticalBiomarkers?.length > 0 && (
            <div>
              <span className="section-label mb-2 block text-rose-600">{t('alert_modal_out_of_range')}</span>
              <ul className="space-y-2">
                {criticalBiomarkers.map((bio, idx) => (
                  <li key={idx} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/5">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span className="font-semibold text-slate-900 dark:text-white">{bio.name}:</span>
                    <span className="font-bold text-rose-600">{bio.value} {bio.unit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mlAnomalies?.length > 0 && (
            <div>
              <span className="section-label mb-2 block text-amber-600">{t('alert_modal_ai_anomalies')}</span>
              <ul className="space-y-2">
                {mlAnomalies.map((bio, idx) => (
                  <li key={idx} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="font-semibold text-slate-900 dark:text-white">{bio.name}:</span>
                    <span className="text-amber-600">{t('alert_modal_unusual_fluctuation')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-slate-200/60 p-4 dark:border-white/8">
          <button onClick={onClose} className="btn-secondary flex-1 text-xs uppercase tracking-wider">
            {t('alert_modal_dismiss')}
          </button>
          <button
            onClick={() => { onClose(); setActiveTab('recommendations'); }}
            className="btn-primary flex-1 bg-gradient-to-r from-rose-500 to-red-600 text-xs uppercase tracking-wider shadow-rose-500/20"
          >
            {t('alert_modal_view_interventions')}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertModal;
