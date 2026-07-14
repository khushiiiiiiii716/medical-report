import React, { useState } from 'react';
import { Bell, FileText, Shield, Check, Lock, Eye, Globe } from 'lucide-react';
import { LANGUAGES } from '../utils/translations';

function SettingsPage({ settingsForm, setSettingsForm, theme, setTheme, lang, setLang, t }) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggles = [
    { key: 'notifications', title: t('settings_notif_title'), desc: t('settings_notif_desc'), icon: <Bell size={18} /> },
    { key: 'weeklyDigest', title: t('settings_digest_title'), desc: t('settings_digest_desc'), icon: <FileText size={18} /> },
    { key: 'mfa', title: t('settings_mfa_title'), desc: t('settings_mfa_desc'), icon: <Shield size={18} /> },
    { key: 'anonymousAnalytics', title: t('settings_analytics_title'), desc: t('settings_analytics_desc'), icon: <Eye size={18} /> },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in-up">

      {/* Language */}
      <div className="soft-card p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
            <Globe size={18} />
          </div>
          <div>
            <h4 className="font-display text-base font-bold text-slate-900 dark:text-white">{t('settings_lang_title')}</h4>
            <p className="text-xs text-slate-500">{t('settings_lang_sub')}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {LANGUAGES.map((lng) => (
            <button
              key={lng.code}
              onClick={() => setLang(lng.code)}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all duration-200 ${
                lang === lng.code
                  ? 'border-blue-500 bg-blue-50/80 shadow-md shadow-blue-500/15 dark:bg-blue-950/30'
                  : 'border-slate-200/80 hover:border-blue-300 hover:shadow-sm dark:border-white/10 dark:hover:border-blue-500/50'
              }`}
            >
              <span className="text-2xl">{lng.flag}</span>
              <div className="text-center">
                <div className="text-xs font-bold text-slate-900 dark:text-white">{lng.nativeLabel}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">{lng.label}</div>
              </div>
              {lang === lng.code && (
                <div className="flex items-center gap-1 rounded-full bg-blue-500 px-2 py-0.5">
                  <Check size={10} className="text-white" />
                  <span className="text-[9px] font-bold uppercase tracking-wide text-white">{t('settings_lang_active')}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications & Security toggles */}
      <div className="soft-card p-8">
        <div className="mb-8">
          <h3 className="font-display text-xl font-bold gradient-text">{t('settings_prefs_title')}</h3>
          <p className="mt-2 text-sm text-slate-500">{t('settings_prefs_sub')}</p>
        </div>
        <div className="space-y-3">
          {toggles.map((s) => (
            <div
              key={s.key}
              className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200/60 bg-slate-50/50 p-4 transition-all hover:border-blue-200/60 hover:shadow-sm dark:border-white/8 dark:bg-white/3"
            >
              <div className="flex items-start gap-3.5">
                <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">{s.icon}</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{s.title}</h4>
                  <p className="mt-0.5 max-w-sm text-xs leading-relaxed text-slate-500">{s.desc}</p>
                </div>
              </div>
              <button
                role="switch"
                aria-checked={settingsForm[s.key]}
                onClick={() => setSettingsForm((prev) => ({ ...prev, [s.key]: !prev[s.key] }))}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${
                  settingsForm[s.key] ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                    settingsForm[s.key] ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="soft-card p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-600 dark:text-indigo-400">
            <Lock size={18} />
          </div>
          <div>
            <h4 className="font-display text-base font-bold text-slate-900 dark:text-white">{t('settings_appearance_title')}</h4>
            <p className="text-xs text-slate-500">{t('settings_appearance_sub')}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'light', label: t('settings_theme_light'), preview: 'bg-gradient-to-br from-blue-50 to-emerald-50' },
            { id: 'dark', label: t('settings_theme_dark'), preview: 'bg-gradient-to-br from-slate-900 to-blue-950' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setTheme(mode.id)}
              className={`rounded-2xl border-2 p-4 text-left transition-all ${
                theme === mode.id
                  ? 'border-blue-500 shadow-md shadow-blue-500/15'
                  : 'border-slate-200/80 hover:border-blue-300 dark:border-white/10'
              }`}
            >
              <div className={`mb-3 h-12 rounded-xl ${mode.preview}`} />
              <div className="text-sm font-bold text-slate-900 dark:text-white">{mode.label}</div>
              {theme === mode.id && (
                <div className="mt-1 text-[10px] font-semibold text-blue-600">{t('settings_lang_active')}</div>
              )}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary w-full">
        <Check size={16} />
        {saved ? t('settings_saved') : t('settings_save')}
      </button>
    </div>
  );
}

export default SettingsPage;
