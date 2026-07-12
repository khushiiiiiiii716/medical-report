import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, ShieldX, ChevronDown, ChevronUp, AlertTriangle, Info } from 'lucide-react';

function FraudAlert({ fraudDetection, t }) {
  const translate = typeof t === 'function' ? t : () => '';
  const [expanded, setExpanded] = useState(false);

  if (!fraudDetection) return null;

  const { fraud_score, risk_level, flags, categories, total_checks_run } = fraudDetection;

  const levelConfig = {
    none: {
      border: 'border-emerald-200/60 dark:border-emerald-900/30',
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/15',
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400',
      bar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      icon: <ShieldCheck size={22} className="text-emerald-500" />,
      label: translate('fraud_none_label') || 'Report Verified',
      sublabel: translate('fraud_none_sub') || 'No integrity issues detected.',
      scoreColor: 'text-emerald-600',
    },
    low: {
      border: 'border-amber-200/60 dark:border-amber-900/30',
      bg: 'bg-amber-50/50 dark:bg-amber-950/15',
      badge: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400',
      bar: 'bg-gradient-to-r from-amber-400 to-yellow-500',
      icon: <ShieldAlert size={22} className="text-amber-500" />,
      label: translate('fraud_low_label') || 'Low Risk',
      sublabel: translate('fraud_low_sub') || 'Minor inconsistencies found.',
      scoreColor: 'text-amber-600',
    },
    medium: {
      border: 'border-orange-200/60 dark:border-orange-900/30',
      bg: 'bg-orange-50/50 dark:bg-orange-950/15',
      badge: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400',
      bar: 'bg-gradient-to-r from-orange-400 to-amber-500',
      icon: <ShieldAlert size={22} className="text-orange-500" />,
      label: translate('fraud_medium_label') || 'Medium Risk',
      sublabel: translate('fraud_medium_sub') || 'Suspicious patterns detected.',
      scoreColor: 'text-orange-600',
    },
    high: {
      border: 'border-rose-200/60 dark:border-rose-900/30',
      bg: 'bg-rose-50/50 dark:bg-rose-950/15',
      badge: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400',
      bar: 'bg-gradient-to-r from-rose-500 to-red-600',
      icon: <ShieldX size={22} className="text-rose-500" />,
      label: translate('fraud_high_label') || 'High Risk',
      sublabel: translate('fraud_high_sub') || 'Significant tampering suspected.',
      scoreColor: 'text-rose-600',
    },
  };

  const cfg = levelConfig[risk_level] || levelConfig.none;

  const catBadgeStyle = (cat) => {
    const map = {
      'Impossible Value': 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400',
      'Internal Inconsistency': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400',
      'Duplicate Values': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400',
      'Metadata Tampering': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400',
      'Temporal Anomaly': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400',
    };
    return map[cat] || 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400';
  };

  return (
    <div className={`soft-card border ${cfg.border} ${cfg.bg} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/80 p-2 shadow-sm dark:bg-white/5">{cfg.icon}</div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${cfg.scoreColor}`}>{cfg.label}</span>
              <span className={`badge border ${cfg.badge}`}>{translate('fraud_score') || 'Score'}: {fraud_score}/100</span>
            </div>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-600 dark:text-slate-400">{cfg.sublabel}</p>
          </div>
        </div>
        {flags?.length > 0 && (
          <button onClick={() => setExpanded((v) => !v)} className="flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-slate-800 dark:hover:text-slate-200">
            {expanded ? translate('fraud_hide_details') || 'Hide' : `${flags.length} issue${flags.length > 1 ? 's' : ''}`}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="w-20 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">{translate('fraud_score') || 'Score'}</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
          <div className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`} style={{ width: `${fraud_score}%` }} />
        </div>
        <span className={`w-8 text-right text-sm font-bold ${cfg.scoreColor}`}>{fraud_score}</span>
      </div>

      {categories?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span key={cat} className={`badge border ${catBadgeStyle(cat)}`}>{cat}</span>
          ))}
        </div>
      )}

      {expanded && flags?.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-slate-200/60 pt-4 dark:border-white/8">
          <p className="section-label">{translate('fraud_detected_issues') || 'Detected Issues'} ({flags.length})</p>
          {flags.map((flag, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl border border-slate-200/60 bg-white/60 p-3 dark:border-white/8 dark:bg-white/3">
              <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-500" />
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{flag}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500">
        <Info size={11} />
        <span>{total_checks_run ? translate('fraud_checks', { count: total_checks_run }) : translate('fraud_checks_default') || 'Integrity checks completed'}</span>
      </div>
    </div>
  );
}

export default FraudAlert;
