import React, { useState, useEffect } from 'react';
import {
  UploadCloud, ShieldCheck, Activity, Clock, ChevronRight, FileText, Zap,
  Brain, Lock, Globe, HeartPulse, Microscope, Stethoscope, ArrowRight, Star
} from 'lucide-react';

const FEATURES = [
  { icon: Brain, label: 'AI Diagnostic Engines', desc: 'Deep learning analysis' },
  { icon: ShieldCheck, label: 'Biomarker Validation', desc: 'Fraud & anomaly detection' },
  { icon: Zap, label: 'Instant Results', desc: 'Analysis in under 3 seconds' },
  { icon: Lock, label: 'Encrypted & Private', desc: 'HIPAA-grade security' },
  { icon: Globe, label: '7 Languages', desc: 'Multilingual support' },
];

const HOW_IT_WORKS = [
  { title: 'Secure Upload', text: 'Drop PDFs or lab images in seconds.', icon: UploadCloud, color: 'from-blue-500 to-cyan-500' },
  { title: 'AI Review', text: 'Abnormal markers surfaced instantly.', icon: Microscope, color: 'from-emerald-500 to-teal-500' },
  { title: 'Actionable Guidance', text: 'Insights & recommendations in one view.', icon: Stethoscope, color: 'from-indigo-500 to-blue-500' },
];

const TESTIMONIALS = [
  { quote: 'Transformed how we interpret lab results for patients.', author: 'Dr. Sharma', role: 'Internal Medicine' },
  { quote: 'The fraud detection alone saved us from a tampered report.', author: 'Lab Director', role: 'Metro Diagnostics' },
];

function LandingPage({ onEnter, t }) {
  const [count, setCount] = useState({ reports: 0, accuracy: 0, diseases: 0, hours: 0 });

  useEffect(() => {
    const targets = { reports: 10450, accuracy: 999, diseases: 50, hours: 4800 };
    const duration = 1400;
    const steps = 50;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / steps, 4);
      setCount({
        reports: Math.floor(ease * targets.reports),
        accuracy: Math.floor(ease * targets.accuracy),
        diseases: Math.floor(ease * targets.diseases),
        hours: Math.floor(ease * targets.hours),
      });
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(160deg,#eff6ff_0%,#f0fdf4_40%,#ecfeff_100%)] text-slate-800 dark:from-[#060d18] dark:via-[#0a1628] dark:to-[#071018] dark:text-slate-100">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl animate-float" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 p-2.5 text-white shadow-glow-teal">
            <Activity size={22} />
          </div>
          <div>
            <div className="font-display text-lg font-bold tracking-wide text-slate-900 dark:text-white">AURA MED</div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">AI Health Intelligence</div>
          </div>
        </div>
        <button onClick={onEnter} className="btn-secondary hidden sm:flex">
          {t('landing_open_dashboard')}
          <ArrowRight size={14} />
        </button>
      </nav>

      {/* Hero */}
      <main className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-14">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-7 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-white/70 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur dark:bg-white/5 dark:text-emerald-400">
              <HeartPulse size={14} />
              {t('landing_badge')}
            </div>

            <h1 className="font-display text-4xl font-bold leading-[1.15] text-slate-900 sm:text-5xl lg:text-[3.4rem] dark:text-white">
              {t('landing_title_prefix')}{' '}
              <span className="gradient-text">{t('landing_title_highlight')}</span>{' '}
              {t('landing_title_suffix')}
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">{t('landing_description')}</p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <button onClick={onEnter} className="group btn-primary px-8 py-4 text-base shadow-glow-teal">
                <UploadCloud size={20} />
                {t('landing_cta')}
                <ChevronRight size={18} className="transition group-hover:translate-x-1" />
              </button>
              <div className="text-sm text-slate-500">
                <div className="font-semibold text-slate-700 dark:text-slate-300">{t('landing_free')}</div>
                <div>{t('landing_signup')}</div>
              </div>
            </div>
          </div>

          {/* Hero card mockup */}
          <div className="w-full max-w-lg animate-fade-in-up-delay-1 opacity-0">
            <div className="glass-panel rounded-[2rem] p-5 shadow-soft-lg">
              <div className="rounded-[1.5rem] border border-slate-200/50 bg-gradient-to-br from-slate-50/80 to-blue-50/60 p-5 dark:border-white/8 dark:from-slate-900/60 dark:to-blue-950/30">
                <div className="mb-4 flex items-center justify-between rounded-2xl border border-emerald-100/80 bg-white/90 px-4 py-3 shadow-sm dark:border-emerald-900/30 dark:bg-white/5">
                  <div>
                    <div className="section-label">Care command center</div>
                    <div className="font-display text-base font-bold text-slate-900 dark:text-white">Live health intelligence</div>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">Secure</div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-white/5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <ShieldCheck size={16} className="text-emerald-500" />
                      Report Integrity
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000" />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-slate-500">
                      <span>Fraud detection</span>
                      <span className="font-bold text-emerald-600">94% clear</span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 p-4 text-white shadow-md">
                    <div className="text-xs font-semibold uppercase tracking-wider text-white/80">Health score</div>
                    <div className="mt-2 font-display text-4xl font-bold">87</div>
                    <div className="mt-1 text-xs text-white/85">Stable with targeted recommendations</div>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {HOW_IT_WORKS.map((step) => (
                    <div key={step.title} className="rounded-xl border border-slate-200/60 bg-white/90 p-3 shadow-sm transition hover:-translate-y-0.5 dark:border-white/8 dark:bg-white/5">
                      <div className={`mb-2 inline-flex rounded-lg bg-gradient-to-br ${step.color} p-1.5 text-white`}>
                        <step.icon size={14} />
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{step.title}</div>
                      <div className="mt-0.5 text-[10px] leading-relaxed text-slate-500">{step.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features grid */}
        <section className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map((f, i) => (
            <div key={f.label} className={`soft-card glass-panel-hover p-5 animate-fade-in-up-delay-${Math.min(i + 1, 3)} opacity-0`}>
              <div className="mb-3 inline-flex rounded-xl bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
                <f.icon size={18} />
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{f.label}</div>
              <div className="mt-1 text-xs text-slate-500">{f.desc}</div>
            </div>
          ))}
        </section>

        {/* Stats */}
        <section className="mt-12 grid gap-4 rounded-[1.75rem] border border-slate-200/60 bg-white/70 p-6 shadow-soft backdrop-blur sm:grid-cols-2 xl:grid-cols-4 dark:border-white/8 dark:bg-white/5">
          {[
            { value: `${(count.reports / 1000).toFixed(1)}k+`, label: 'Reports Analyzed', icon: FileText, color: 'text-blue-600' },
            { value: `${(count.accuracy / 10).toFixed(1)}%`, label: 'Diagnostic Accuracy', icon: ShieldCheck, color: 'text-emerald-600' },
            { value: `${count.diseases}+`, label: 'Anomalies Covered', icon: Clock, color: 'text-amber-600' },
            { value: `${(count.hours / 1000).toFixed(1)}k+`, label: 'Physician Hours Saved', icon: Activity, color: 'text-indigo-600' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-4 rounded-2xl bg-slate-50/80 p-4 transition hover:scale-[1.02] dark:bg-white/3">
              <div className={`rounded-2xl bg-white p-3 shadow-sm dark:bg-white/5 ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <div>
                <div className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Testimonials */}
        <section className="mt-12 grid gap-4 md:grid-cols-2">
          {TESTIMONIALS.map((item) => (
            <div key={item.author} className="soft-card p-6">
              <div className="mb-3 flex gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-sm italic leading-relaxed text-slate-600 dark:text-slate-400">"{item.quote}"</p>
              <div className="mt-4">
                <div className="text-sm font-bold text-slate-900 dark:text-white">{item.author}</div>
                <div className="text-xs text-slate-500">{item.role}</div>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-200/60 bg-white/60 py-5 text-center text-sm text-slate-500 backdrop-blur dark:border-white/8 dark:bg-black/20">
        {t('landing_footer')}
      </footer>
    </div>
  );
}

export default LandingPage;
