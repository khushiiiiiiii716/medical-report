import React, { useState } from 'react';
import { GitCompare, ChevronDown, TrendingUp, TrendingDown, Minus, X, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function ReportComparison({ reports, isOpen, onClose, t }) {
  const [leftIdx,  setLeftIdx]  = useState(0);
  const [rightIdx, setRightIdx] = useState(Math.min(1, reports.length - 1));

  if (!isOpen) return null;

  /* ── Not enough reports ─────────────────────────────────────────────────── */
  if (reports.length < 2) {
    return (
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
        role="dialog" aria-modal="true"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="w-full max-w-sm rounded-3xl border border-slate-200/60 bg-white p-8 text-center shadow-2xl dark:border-white/10 dark:bg-[#0f1729]">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 dark:bg-blue-950/40">
            <BarChart2 size={32} />
          </div>
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            {t('compare_need_more_title') || 'More Reports Required'}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {t('compare_need_more_body') || 'Upload at least two reports to compare trends side-by-side.'}
          </p>
          <button onClick={onClose} className="btn-primary mt-6 w-full">
            {t('compare_got_it') || 'Got it'}
          </button>
        </div>
      </div>
    );
  }

  const left  = reports[leftIdx];
  const right = reports[rightIdx];
  const allNames = [...new Set([
    ...(left.biomarkers  ?? []).map((b) => b.name),
    ...(right.biomarkers ?? []).map((b) => b.name),
  ])];

  const getBio  = (rep, name) => rep.biomarkers?.find((b) => b.name === name);
  const getDiff = (l, r) => {
    const lv = parseFloat(l?.value), rv = parseFloat(r?.value);
    return isNaN(lv) || isNaN(rv) ? null : rv - lv;
  };

  const statusColor = {
    Normal:     'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400',
    High:       'text-rose-600   bg-rose-50    border-rose-200    dark:bg-rose-950/40    dark:text-rose-400',
    Low:        'text-blue-600   bg-blue-50    border-blue-200    dark:bg-blue-950/40    dark:text-blue-400',
    Borderline: 'text-amber-600  bg-amber-50   border-amber-200   dark:bg-amber-950/40   dark:text-amber-400',
  };

  const scoreChartData = [
    { name: 'Report A', score: left.health_score,  fill: '#10b981' },
    { name: 'Report B', score: right.health_score, fill: '#2563eb' },
  ];

  return (
    /*
      z-[200] → always above sidebar (z-50) and header (z-30)
      The backdrop fills the screen; clicking it closes the modal.
      The card is a fixed-height flex column:
        - header: shrink-0 (never scrolls away)
        - body:   flex-1 overflow-y-auto (all scrolling happens here)
    */
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
      role="dialog" aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0f1729]"
        style={{ height: 'min(90vh, 820px)' }}
      >

        {/* ── Sticky header ──────────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/20 bg-white/10 p-2 backdrop-blur">
              <GitCompare size={18} />
            </div>
            <div>
              <h3 className="font-display text-base font-bold">
                {t('compare_title') || 'Report Comparison'}
              </h3>
              <p className="text-[10px] text-white/80">
                {t('compare_subtitle') || 'Side-by-side biomarker analysis'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 p-2 transition hover:bg-white/20"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Report selectors */}
          <div className="grid grid-cols-2 gap-3 border-b border-slate-200/60 bg-slate-50/60 p-4 dark:border-white/8 dark:bg-white/3">
            {[
              { label: t('compare_report_a') || 'Report A', idx: leftIdx,  setIdx: setLeftIdx,  accent: 'border-emerald-400/50 bg-emerald-50/60 dark:bg-emerald-950/20' },
              { label: t('compare_report_b') || 'Report B', idx: rightIdx, setIdx: setRightIdx, accent: 'border-blue-400/50    bg-blue-50/60    dark:bg-blue-950/20'    },
            ].map(({ label, idx, setIdx, accent }) => (
              <div key={label}>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <div className={`relative overflow-hidden rounded-2xl border-2 ${accent}`}>
                  <select
                    value={idx}
                    onChange={(e) => setIdx(Number(e.target.value))}
                    className="w-full cursor-pointer appearance-none bg-transparent py-2.5 pl-3 pr-8 text-xs font-semibold text-slate-900 focus:outline-none dark:text-white"
                  >
                    {reports.map((r, i) => (
                      <option key={i} value={i}>
                        {r.filename} ({new Date(r.upload_date).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            ))}
          </div>

          {/* Health score cards */}
          <div className="grid grid-cols-2 gap-3 border-b border-slate-200/60 p-4 dark:border-white/8">
            {[left, right].map((r, i) => (
              <div key={i} className={`rounded-2xl border p-4 ${
                i === 0
                  ? 'border-emerald-400/30 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-blue-400/30    bg-blue-50/40    dark:bg-blue-950/20'
              }`}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t('compare_health_score') || 'Health Score'}
                </p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className={`font-display text-3xl font-bold ${i === 0 ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {r.health_score}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
                <p className="mt-0.5 truncate text-[10px] text-slate-500">{r.filename}</p>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="border-b border-slate-200/60 px-4 pb-4 pt-3 dark:border-white/8">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Score Comparison</p>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreChartData} barSize={40}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }} />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {scoreChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Biomarker table */}
          <div className="overflow-x-auto p-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200/60 text-[10px] uppercase tracking-wider text-slate-400 dark:border-white/8">
                  <th className="pb-3 text-left font-bold">Biomarker</th>
                  <th className="pb-3 text-center font-bold text-emerald-600">Report A</th>
                  <th className="pb-3 text-center font-bold text-slate-500">Change</th>
                  <th className="pb-3 text-center font-bold text-blue-600">Report B</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {allNames.map((name) => {
                  const l = getBio(left,  name);
                  const r = getBio(right, name);
                  const d = getDiff(l, r);
                  return (
                    <tr key={name} className="transition hover:bg-slate-50/60 dark:hover:bg-white/3">
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{name}</td>

                      <td className="py-3 text-center">
                        {l ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {l.value} <span className="font-normal text-slate-400">{l.unit}</span>
                            </span>
                            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${statusColor[l.status] ?? ''}`}>
                              {l.status}
                            </span>
                          </div>
                        ) : <span className="text-slate-300">—</span>}
                      </td>

                      <td className="py-3 text-center">
                        {d !== null ? (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            d > 0 ? 'bg-rose-50   text-rose-600   dark:bg-rose-950/30'
                          : d < 0 ? 'bg-blue-50   text-blue-600   dark:bg-blue-950/30'
                          :         'bg-slate-100 text-slate-500 dark:bg-white/5'
                          }`}>
                            {d > 0 ? <TrendingUp size={11} /> : d < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
                            {d > 0 ? '+' : ''}{d.toFixed(1)}
                          </span>
                        ) : <Minus size={12} className="mx-auto text-slate-300" />}
                      </td>

                      <td className="py-3 text-center">
                        {r ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {r.value} <span className="font-normal text-slate-400">{r.unit}</span>
                            </span>
                            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${statusColor[r.status] ?? ''}`}>
                              {r.status}
                            </span>
                          </div>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>{/* end scrollable body */}
      </div>
    </div>
  );
}

export default ReportComparison;
