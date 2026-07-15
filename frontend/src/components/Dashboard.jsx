import React, { useState, useEffect } from 'react';
import {
  Heart, TrendingUp, TrendingDown, AlertCircle, Download, Search,
  Calendar, Sparkles, Droplet, ActivitySquare, Stethoscope, Loader2, FileText
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart
} from 'recharts';
import FraudAlert from './FraudAlert';
import RiskPredictor from './RiskPredictor';
import BodyMap from './BodyMap';
import ProgressRing from './ui/ProgressRing';
import { SkeletonChart } from './ui/Skeleton';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function Dashboard({ report, reportsList, setActiveTab, setActiveReportIndex, t }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isDownloading, setIsDownloading] = useState(false);
  const [trendData, setTrendData] = useState([
    { date: 'Jan', Hemoglobin: 13.1, 'Fasting Glucose': 95, 'Total Cholesterol': 190 },
    { date: 'Feb', Hemoglobin: 13.4, 'Fasting Glucose': 98, 'Total Cholesterol': 186 },
    { date: 'Mar', Hemoglobin: 13.8, 'Fasting Glucose': 101, 'Total Cholesterol': 184 },
    { date: 'Apr', Hemoglobin: 13.5, 'Fasting Glucose': 99, 'Total Cholesterol': 182 },
    { date: 'May', Hemoglobin: 13.9, 'Fasting Glucose': 97, 'Total Cholesterol': 180 },
  ]);
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);

  useEffect(() => {
    const loadTrendData = async () => {
      setIsLoadingTrends(true);
      try {
        const response = await fetch(`${API_BASE_URL}/trends`);
        if (response.ok) {
          const data = await response.json();
          if (data?.length > 0) setTrendData(data);
        }
      } catch (e) {
        console.log('Using mock trend data.', e);
      } finally {
        setIsLoadingTrends(false);
      }
    };
    loadTrendData();
  }, [reportsList]);

  if (!report) {
    return (
      <div className="mx-auto max-w-lg animate-scale-in soft-card px-8 py-16 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 text-amber-500">
          <AlertCircle size={40} />
        </div>
        <h3 className="mb-2 font-display text-xl font-bold text-slate-900 dark:text-white">No reports yet</h3>
        <p className="text-sm text-slate-500">Upload a clinical report to initialize your AI health profile and diagnostics dashboard.</p>
      </div>
    );
  }

  const categories = ['All', ...new Set(report.biomarkers.map((b) => b.category))];
  const filteredBiomarkers = report.biomarkers.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (activeCategory === 'All' || b.category === activeCategory);
  });
  const abnormalitiesCount = report.biomarkers.filter((b) => b.status !== 'Normal').length;
  const score = report.health_score ?? 0;

  let scoreColor = '#10B981';
  let scoreText = t('score_excellent') || 'Excellent';
  let scoreClass = 'text-emerald-600';

  if (score < 60) {
    scoreColor = '#EF4444';
    scoreText = t('score_attention') || 'Attention Required';
    scoreClass = 'text-rose-600';
  } else if (score < 75) {
    scoreColor = '#F59E0B';
    scoreText = t('score_moderate') || 'Moderate';
    scoreClass = 'text-amber-600';
  } else if (score < 90) {
    scoreColor = '#0EA5E9';
    scoreText = t('score_good') || 'Good';
    scoreClass = 'text-cyan-600';
  }

  let highestRisk = 'Low Risk';
  let riskColor = 'text-emerald-600';
  let bgRiskColor = 'bg-emerald-50 dark:bg-emerald-950/20';

  if (report.risks) {
    const risksArray = [
      { name: 'Diabetes', value: report.risks.diabetes || 0 },
      { name: 'Heart Disease', value: report.risks.heart_disease || 0 },
      { name: 'Anemia', value: report.risks.anemia || 0 }
    ].sort((a, b) => b.value - a.value);

    if (risksArray[0].value > 70) {
      highestRisk = `${risksArray[0].name} (High)`;
      riskColor = 'text-rose-600';
      bgRiskColor = 'bg-rose-50 dark:bg-rose-950/20';
    } else if (risksArray[0].value > 40) {
      highestRisk = `${risksArray[0].name} (Moderate)`;
      riskColor = 'text-amber-600';
      bgRiskColor = 'bg-amber-50 dark:bg-amber-950/20';
    } else {
      highestRisk = 'Low / Normal Risk';
    }
  }

  const topRecommendation = report.recommendations?.lifestyle?.[0] || report.recommendations?.diet?.[0] || 'Keep maintaining a healthy dietary balance.';

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/report/${report.id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Health_Summary_${report.filename.replace(/\.[^/.]+$/, '')}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to download PDF summary report.');
      }
    } catch (e) {
      alert('Error downloading PDF report.');
    } finally {
      setIsDownloading(false);
    }
  };

  const getBioStyles = (status) => {
    const map = {
      High: {
        gradient: 'from-rose-50/80 to-red-50/40 dark:from-rose-950/30 dark:to-red-950/10',
        border: 'border-rose-200/80 dark:border-rose-900/30',
        badge: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300',
        value: 'text-rose-600 dark:text-rose-400',
        bar: 'from-rose-400 to-red-500',
        icon: <TrendingUp size={18} className="text-rose-500" />,
        iconBg: 'bg-rose-100/70 dark:bg-rose-900/30',
      },
      Low: {
        gradient: 'from-blue-50/80 to-indigo-50/40 dark:from-blue-950/30 dark:to-indigo-950/10',
        border: 'border-blue-200/80 dark:border-blue-900/30',
        badge: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300',
        value: 'text-blue-600 dark:text-blue-400',
        bar: 'from-blue-400 to-indigo-500',
        icon: <TrendingDown size={18} className="text-blue-500" />,
        iconBg: 'bg-blue-100/70 dark:bg-blue-900/30',
      },
      Borderline: {
        gradient: 'from-amber-50/80 to-orange-50/40 dark:from-amber-950/30 dark:to-orange-950/10',
        border: 'border-amber-200/80 dark:border-amber-900/30',
        badge: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300',
        value: 'text-amber-600 dark:text-amber-400',
        bar: 'from-amber-400 to-orange-500',
        icon: <AlertCircle size={18} className="text-amber-500" />,
        iconBg: 'bg-amber-100/70 dark:bg-amber-900/30',
      },
      Normal: {
        gradient: 'from-emerald-50/80 to-green-50/40 dark:from-emerald-950/30 dark:to-green-950/10',
        border: 'border-emerald-200/80 dark:border-emerald-900/30',
        badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300',
        value: 'text-emerald-600 dark:text-emerald-400',
        bar: 'from-emerald-400 to-green-500',
        icon: <ActivitySquare size={18} className="text-emerald-500" />,
        iconBg: 'bg-emerald-100/70 dark:bg-emerald-900/30',
      },
    };
    return map[status] || map.Normal;
  };

  return (
    <div className="space-y-6 pb-10 animate-fade-in-up">
      {report.is_emergency && (
        <div className="flex items-start gap-4 rounded-3xl border border-rose-200/80 bg-gradient-to-r from-rose-50/90 to-red-50/60 p-5 shadow-sm backdrop-blur dark:border-rose-900/40 dark:from-rose-950/30 dark:to-red-950/20" role="alert">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/40">
            <AlertCircle size={22} />
          </div>
          <div>
            <p className="section-label text-rose-600">Critical clinical advisory</p>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Emergency parameters detected</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">This report contains biomarkers outside recommended thresholds. Review recommendations and consult your clinician.</p>
          </div>
        </div>
      )}

      {/* Hero stats row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="stat-card group">
          <div className="mb-3 flex items-center gap-2 section-label">
            <Heart size={14} className={scoreClass} />
            {t('health_score')}
          </div>
          <div className="flex items-center gap-4">
            <ProgressRing value={score} size={72} stroke={6} color={scoreColor} />
            <div>
              <div className={`font-display text-lg font-bold ${scoreClass}`}>{scoreText}</div>
              <div className="text-xs text-slate-500">Overall wellbeing index</div>
            </div>
          </div>
        </div>

        <div className={`stat-card ${bgRiskColor}`}>
          <div className="section-label mb-3">{t('dashboard_risk_level')}</div>
          <div className={`font-display text-lg font-bold ${riskColor}`}>{highestRisk}</div>
          <div className="mt-1 text-xs text-slate-500">AI risk modeling</div>
        </div>

        <div className="stat-card bg-gradient-to-br from-blue-50/60 to-cyan-50/40 dark:from-blue-950/20 dark:to-cyan-950/10">
          <div className="mb-3 flex items-center gap-2 section-label text-blue-600">
            <Sparkles size={14} />
            {t('dashboard_ai_recommendation')}
          </div>
          <p className="text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300 line-clamp-3">"{topRecommendation}"</p>
        </div>

        <div className="stat-card">
          <div className="section-label mb-3">Active document</div>
          <div className="flex items-start gap-2">
            <FileText size={16} className="mt-0.5 shrink-0 text-blue-500" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{report.filename}</div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar size={12} className="text-cyan-500" />
                {new Date(report.upload_date).toLocaleDateString()}
              </div>
            </div>
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="btn-secondary mt-4 w-full text-xs"
          >
            {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {isDownloading ? 'Generating…' : 'Download PDF Summary'}
          </button>
        </div>
      </div>

      {/* Clinical snapshot + chart */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel rounded-3xl p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 section-label">
                <Stethoscope size={14} className="text-blue-500" />
                {t('dashboard_title')}
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Clinical snapshot</h3>
              <p className="mt-1 text-sm text-slate-500">
                <span className="font-semibold text-amber-600">{abnormalitiesCount}</span> biomarkers need attention
              </p>
            </div>
            <button onClick={() => setActiveTab('history')} className="btn-secondary text-xs">
              View history
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Total Parameters', value: report.biomarkers.length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
              { label: 'Abnormal', value: abnormalitiesCount, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/30' },
              { label: 'Normal', value: report.biomarkers.length - abnormalitiesCount, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
            ].map((stat) => (
              <div key={stat.label} className={`rounded-2xl ${stat.bg} p-4 text-center transition-transform hover:scale-[1.02]`}>
                <div className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="section-label">Trend monitor</div>
              <div className="font-display text-lg font-bold text-slate-900 dark:text-white">Historical trajectory</div>
            </div>
            <button onClick={() => setActiveTab('history')} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-blue-600 dark:hover:bg-blue-500">
              {t('dashboard_history')}
            </button>
          </div>

          {isLoadingTrends ? (
            <SkeletonChart />
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="gradHemo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradGlucose" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(148,163,184,0.2)', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="Hemoglobin" stroke="#0EA5E9" fill="url(#gradHemo)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Fasting Glucose" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Total Cholesterol" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {report.fraud_detection && <FraudAlert fraudDetection={report.fraud_detection} t={t} />}
      {report.risks && <RiskPredictor risks={report.risks} />}

      {/* Interactive Body Map */}
      <BodyMap biomarkers={report.biomarkers} risks={report.risks} />

      {/* Biomarker grid */}
      <div className="soft-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 section-label">
              <Droplet className="text-rose-500" size={16} />
              {t('dashboard_blood_summary')}
            </div>
            <h3 className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
              {t('dashboard_blood_summary_sub', { count: report.biomarkers.length })}
            </h3>
          </div>
          <div className="relative w-full md:w-72">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field py-2.5 pl-10"
              aria-label="Search biomarkers"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Biomarker categories">
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                  : 'border border-slate-200/80 bg-white/80 text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-white/10 dark:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredBiomarkers.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 py-14 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/3">
            No parameters match your search criteria.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBiomarkers.map((bio, idx) => {
              const s = getBioStyles(bio.status);
              return (
                <div
                  key={bio.name}
                  className={`group relative overflow-hidden rounded-3xl border bg-gradient-to-br ${s.gradient} ${s.border} p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover`}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${s.bar}`} />
                  <div className="flex items-start justify-between pl-2">
                    <div className={`rounded-xl p-2 ${s.iconBg} transition-transform group-hover:scale-110`}>{s.icon}</div>
                    <span className={`badge border ${s.badge}`}>{bio.status}</span>
                  </div>
                  <div className="mt-4 pl-2">
                    <div className="truncate text-sm font-bold text-slate-900 dark:text-white" title={bio.name}>{bio.name}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{bio.category}</div>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className={`font-display text-2xl font-bold tabular-nums ${s.value}`}>{bio.value}</span>
                      <span className="text-xs font-medium text-slate-400">{bio.unit}</span>
                    </div>
                    <div className="mt-3 border-t border-slate-200/50 pt-2.5 text-[10px] text-slate-500 dark:border-white/5">
                      Ref: <span className="font-mono font-semibold text-slate-600 dark:text-slate-400">{bio.reference_range}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
