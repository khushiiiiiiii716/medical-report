import React, { useState } from 'react';
import { Apple, Dumbbell, Sun, Sparkles, CheckCircle2 } from 'lucide-react';

function Recommendations({ report, t }) {
  const [activeSubTab, setActiveSubTab] = useState('diet');
  const [checkedItems, setCheckedItems] = useState({});

  if (!report) {
    return (
      <div className="mx-auto max-w-lg soft-card py-16 text-center">
        <Sparkles size={40} className="mx-auto mb-4 text-blue-400" />
        <p className="text-sm text-slate-500">Upload a report to receive personalized health recommendations.</p>
      </div>
    );
  }

  const recs = report.recommendations;
  const toggleCheck = (category, index) => {
    const key = `${category}-${index}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
    { key: 'diet', icon: Apple, label: t('tab_diet') || 'Dietary Roadmap', heading: t('diet_heading') || 'Nutritional Action Plan', color: 'from-green-500 to-emerald-500' },
    { key: 'exercise', icon: Dumbbell, label: t('tab_exercise') || 'Exercise Program', heading: t('exercise_heading') || 'Physiology & Exercise', color: 'from-blue-500 to-cyan-500' },
    { key: 'lifestyle', icon: Sun, label: t('tab_lifestyle') || 'Sleep & Habits', heading: t('lifestyle_heading') || 'Daily Habits Guidelines', color: 'from-amber-500 to-orange-500' },
  ];

  const activeTab = tabs.find((tab) => tab.key === activeSubTab);
  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalItems = (recs.diet?.length || 0) + (recs.exercise?.length || 0) + (recs.lifestyle?.length || 0);
  const progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="soft-card overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-emerald-500/10 p-6 dark:from-blue-950/30 dark:via-cyan-950/20 dark:to-emerald-950/20">
          <div className="flex items-center gap-2 section-label text-blue-600">
            <Sparkles size={14} />
            {t('rec_title') || 'Personalized Health Interventions'}
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Based on <strong className="text-slate-900 dark:text-white">{report.filename}</strong> (Score: {report.health_score}/100), AI built this customized plan to optimize your health metrics.
          </p>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs font-semibold">
              <span className="text-slate-500">Completion progress</span>
              <span className="text-blue-600">{completedCount}/{totalItems} ({progress}%)</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200/60 bg-slate-50/60 p-1.5 dark:border-white/8 dark:bg-white/3" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeSubTab === tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeSubTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-[#141f33] dark:text-blue-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="soft-card min-h-[280px] p-6">
        <div className="mb-5 flex items-center gap-2">
          <div className={`rounded-xl bg-gradient-to-br ${activeTab.color} p-2 text-white`}>
            <activeTab.icon size={18} />
          </div>
          <h4 className="font-display text-base font-bold text-slate-900 dark:text-white">{activeTab.heading}</h4>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {(recs[activeSubTab] || []).map((item, idx) => {
            const isChecked = checkedItems[`${activeSubTab}-${idx}`];
            return (
              <div
                key={idx}
                onClick={() => toggleCheck(activeSubTab, idx)}
                role="checkbox"
                aria-checked={isChecked}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleCheck(activeSubTab, idx)}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all duration-300 ${
                  isChecked
                    ? 'border-emerald-500/30 bg-emerald-50/50 opacity-70 dark:bg-emerald-950/15'
                    : 'border-slate-200/60 bg-slate-50/40 hover:border-blue-300/60 hover:shadow-sm dark:border-white/8 dark:bg-white/3'
                }`}
              >
                <CheckCircle2 size={18} className={`mt-0.5 shrink-0 transition-colors ${isChecked ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`} />
                <p className={`text-sm leading-relaxed ${isChecked ? 'text-slate-400 line-through' : 'font-medium text-slate-700 dark:text-slate-300'}`}>{item}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Recommendations;
