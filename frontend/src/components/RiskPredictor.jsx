import React from 'react';
import { Sparkles, Heart, Activity, CheckCircle, Droplets } from 'lucide-react';

function RiskPredictor({ risks }) {
  const getRiskClassification = (risk) => {
    if (risk >= 60) return { label: 'Critical Risk', color: 'text-rose-600', bg: 'from-rose-50/80 to-red-50/40 dark:from-rose-950/25 dark:to-red-950/10', border: 'border-rose-200/60 dark:border-rose-900/30', bar: 'bg-gradient-to-r from-rose-500 to-red-600' };
    if (risk >= 35) return { label: 'Elevated Risk', color: 'text-amber-600', bg: 'from-amber-50/80 to-orange-50/40 dark:from-amber-950/25 dark:to-orange-950/10', border: 'border-amber-200/60 dark:border-amber-900/30', bar: 'bg-gradient-to-r from-amber-400 to-orange-500' };
    return { label: 'Low Risk', color: 'text-emerald-600', bg: 'from-emerald-50/80 to-green-50/40 dark:from-emerald-950/25 dark:to-green-950/10', border: 'border-emerald-200/60 dark:border-emerald-900/30', bar: 'bg-gradient-to-r from-emerald-500 to-teal-500' };
  };

  const cards = [
    { key: 'diabetes', label: 'Diabetes Mellitus', value: risks.diabetes, icon: Activity, iconColor: 'text-amber-500', desc: 'Based on glucose, HbA1c, age, BMI, and family history.' },
    { key: 'heart_disease', label: 'Cardiovascular Disease', value: risks.heart_disease, icon: Heart, iconColor: 'text-rose-500', desc: 'Evaluated against cholesterol, blood pressure, and lifestyle.' },
    { key: 'anemia', label: 'Anemia Deficiency', value: risks.anemia, icon: Droplets, iconColor: 'text-blue-500', desc: 'Based on hemoglobin, RBC count, and demographic factors.' },
  ];

  return (
    <div className="soft-card p-6">
      <div className="mb-6 flex items-center gap-2">
        <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
          <Sparkles size={16} />
        </div>
        <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">AI-Powered Disease Risk Assessment</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const cls = getRiskClassification(card.value);
          const Icon = card.icon;
          return (
            <div key={card.key} className={`rounded-2xl border bg-gradient-to-br ${cls.bg} ${cls.border} p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-card`}>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{card.label}</span>
                <Icon size={18} className={card.iconColor} />
              </div>
              <p className="mb-4 text-[11px] leading-relaxed text-slate-500">{card.desc}</p>
              <div className="flex items-baseline justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${cls.color}`}>{cls.label}</span>
                <span className="font-display text-2xl font-bold text-slate-900 dark:text-white">{card.value}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
                <div className={`h-full rounded-full transition-all duration-1000 ${cls.bar}`} style={{ width: `${card.value}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-start gap-2 text-[10px] leading-relaxed text-slate-500">
        <CheckCircle size={12} className="mt-0.5 shrink-0 text-emerald-500" />
        <p>Statistical risk estimates from ML models. Not a substitute for clinical diagnosis or physician advice.</p>
      </div>
    </div>
  );
}

export default RiskPredictor;
