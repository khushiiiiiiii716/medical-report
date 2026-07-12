import React, { useState } from 'react';
import { GitCompare, ChevronDown, TrendingUp, TrendingDown, Minus, X, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function ReportComparison({ reports, isOpen, onClose, t }) {
  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(Math.min(1, reports.length - 1));

  if (!isOpen) return null;

  if (reports.length < 2) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true">
        <div className="w-full max-w-sm animate-scale-in rounded-3xl border border-slate-200/60 bg-white p-8 text-center shadow-soft-lg dark:border-white/10 dark:bg-[#0f1729]">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 dark:bg-blue-950/40">
            <BarChart2 size={32} />
          </div>
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">{t('compare_need_more_title') || 'More Reports Required'}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{t('compare_need_more_body') || 'Upload at least two reports to compare trends side-by-side.'}</p>
          <button onClick={onClose} className="btn-primary mt-6 w-full">{t('compare_got_it') || 'Got it'}</button>
        </div>
      </div>
    );
  }

  const left = reports[leftIdx];
  const right = reports[rightIdx];
  const allNames = [...new Set([...(left.biomarkers ?? []).map((b) => b.name), ...(right.biomarkers ?? []).map((b) => b.name)])];

  const getBio = (report, name) => report.biomarkers?.find((b) => b.name === name);
  const diff = (l, r) => {
    const lv = parseFloat(l?.value), rv = parseFloat(r?.value);
    return isNaN(lv) || isNaN(rv) ? null : rv - lv;
  };

  const statusColor = {
    Normal: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400',
    High: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400',
    Low: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400',
    Borderline: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400',
  };

  const scoreChartData = [
    { name: 'Report A', score: left.health_score, fill: '#10b981' },
    { name: 'Report B', score: right.health_score, fill: '#2563eb' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 py-6 px-4 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true">
      <div className="my-auto w-full max-w-4xl animate-scale-in overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-soft-lg dark:border-white/10 dark:bg-[#0f1729]">
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-500 p-5 text-white sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/20 bg-white/10 p-2.5 backdrop-blur"><GitCompare size={20} /></div>
            <div>
              <h3 className="font-display text-lg font-bold">{t('compare_title') || 'Report Comparison'}</h3>
              <p className="text-xs text-white/80">{t('compare_subtitle') || 'Side-by-side biomarker analysis'}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl bg-white/10 p-2 transition hover:bg-white/20" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-1 gap-4 border-b border-slate-200/60 bg-slate-50/50 p-4 sm:grid-cols-2 dark:border-white/8 dark:bg-white/3">
          {[
            { label: t('compare_report_a') || 'Report A', idx: leftIdx, setIdx: setLeftIdx, accent: 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20' },
            { label: t('compare_report_b') || 'Report B', idx: rightIdx, setIdx: setRightIdx, accent: 'border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20' },
          ].map(({ label, idx, setIdx, accent }) => (
            <div key={label}>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
              <div className={`relative overflow-hidden rounded-2xl border ${accent}`}>
                <select value={idx} onChange={(e) => setIdx(Number(e.target.value))} className="w-full cursor-pointer appearance-none bg-transparent py-3 pl-4 pr-10 text-xs font-semibold text-slate-900 focus:outline-none dark:text-white">
                  {reports.map((r, i) => (
                    <option key={i} value={i}>{r.filename} ({new Date(r.upload_date).toLocaleDateString()})</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 border-b border-slate-200/60 p-4 sm:grid-cols-2 dark:border-white/8">
          {[left, right].map((r, i) => (
            <div key={i} className={`rounded-2xl border p-4 ${i === 0 ? 'border-emerald-500/25 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-blue-500/25 bg-blue-50/40 dark:bg-blue-950/20'}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('compare_health_score') || 'Health Score'}</p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`font-display text-3xl font-bold ${i === 0 ? 'text-emerald-600' : 'text-blue-600'}`}>{r.health_score}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <p className="mt-1 truncate text-[10px] text-slate-500">{r.filename}</p>
            </div>
          ))}
        </div>

        <div className="border-b border-slate-200/60 p-4 dark:border-white/8">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Score comparison</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreChartData} barSize={40}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {scoreChartData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="overflow-x-auto p-4 sm:p-5">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200/60 text-[10px] uppercase tracking-wider text-slate-400 dark:border-white/8">
                <th className="pb-3 text-left font-bold">Biomarker</th>
                <th className="pb-3 text-center font-bold text-emerald-600">Report A</th>
                <th className="pb-3 text-center font-bold">Change</th>
                <th className="pb-3 text-center font-bold text-blue-600">Report B</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {allNames.map((name) => {
                const l = getBio(left, name);
                const r = getBio(right, name);
                const d = diff(l, r);
                return (
                  <tr key={name} className="transition hover:bg-slate-50/60 dark:hover:bg-white/3">
                    <td className="py-3.5 font-semibold text-slate-800 dark:text-slate-200">{name}</td>
                    <td className="py-3.5 text-center">
                      {l ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-slate-900 dark:text-white">{l.value} <span className="font-normal text-slate-400">{l.unit}</span></span>
                          <span className={`badge border ${statusColor[l.status] ?? ''}`}>{l.status}</span>
                        </div>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-3.5 text-center">
                      {d !== null ? (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                          d > 0 ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30' :
                          d < 0 ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30' :
                          'bg-slate-100 text-slate-500 dark:bg-white/5'
                        }`}>
                          {d > 0 ? <TrendingUp size={12} /> : d < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                          {d > 0 ? '+' : ''}{d.toFixed(1)}
                        </span>
                      ) : <Minus size={12} className="mx-auto text-slate-300" />}
                    </td>
                    <td className="py-3.5 text-center">
                      {r ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-slate-900 dark:text-white">{r.value} <span className="font-normal text-slate-400">{r.unit}</span></span>
                          <span className={`badge border ${statusColor[r.status] ?? ''}`}>{r.status}</span>
                        </div>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReportComparison;
