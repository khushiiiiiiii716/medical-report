import React, { useState, useEffect } from 'react';
import {
  Activity, FileText, MessageSquare, User, Sparkles, Globe, Sun, Moon,
  Mic, GitCompare, LogOut, Settings, Menu, X, Pill
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import ReportUpload from './components/ReportUpload';
import Recommendations from './components/Recommendations';
import ChatBot from './components/ChatBot';
import ReportHistory from './components/ReportHistory';
import AlertModal from './components/AlertModal';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import VoiceAssistant from './components/VoiceAssistant';
import ReportComparison from './components/ReportComparison';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import MedicationReminder from './components/MedicationReminder';

import { DEFAULT_PROFILE, MOCK_REPORTS } from './utils/mockData';
import { LANGUAGES, useTranslation } from './utils/translations';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function App() {
  const [hasStarted, setHasStarted] = useState(() => sessionStorage.getItem('aura_has_started') === 'true');
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!sessionStorage.getItem('aura_user'));
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lang, setLang] = useState(() => localStorage.getItem('aura_lang') || 'en');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(DEFAULT_PROFILE);
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [activeReportIndex, setActiveReportIndex] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('aura_theme') || 'light');
  const [settingsForm, setSettingsForm] = useState({
    notifications: true,
    weeklyDigest: false,
    mfa: true,
    anonymousAnalytics: true,
  });
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [criticalBiomarkers, setCriticalBiomarkers] = useState([]);
  const [mlAnomalies, setMlAnomalies] = useState([]);
  const [emergencyAlert, setEmergencyAlert] = useState(null);

  const t = useTranslation(lang);

  useEffect(() => { localStorage.setItem('aura_lang', lang); }, [lang]);
  useEffect(() => { sessionStorage.setItem('aura_has_started', hasStarted ? 'true' : 'false'); }, [hasStarted]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('aura_theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchProfile();
    fetchReports();
  }, [lang]);

  const fetchProfile = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/user/profile`);
      if (r.ok) { setUserProfile(await r.json()); setIsConnected(true); }
    } catch { /* use mock */ }
  };

  const fetchReports = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/reports?lang=${lang}`);
      if (r.ok) {
        const data = await r.json();
        if (data?.length > 0) { setReports(data); setIsConnected(true); }
      }
    } catch { /* use mock */ }
  };

  const handleUpdateProfile = async (updated) => {
    setUserProfile(updated);
    try {
      const r = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (r.ok) { setUserProfile(await r.json()); fetchReports(); }
    } catch { /* offline */ }
  };

  const handleUploadSuccess = (newReport) => {
    setReports((prev) => [newReport, ...prev]);
    setActiveReportIndex(0);
    setActiveTab('dashboard');
    setIsConnected(true);

    if (newReport?.biomarkers) {
      const critical = newReport.biomarkers.filter((b) => b.status === 'High' || b.status === 'Low');
      const ml = newReport.biomarkers.filter((b) => b.is_trend_anomaly);
      const emergency = newReport.emergency_alert || {
        is_emergency: critical.length > 0 || ml.length > 0,
        critical_count: critical.length,
        trend_anomaly_count: ml.length,
      };
      newReport.is_emergency = emergency.is_emergency;
      newReport.emergency_alert = emergency;
      if (emergency.is_emergency) {
        setCriticalBiomarkers(critical);
        setMlAnomalies(ml);
        setEmergencyAlert(emergency);
        setAlertModalOpen(true);
      } else {
        setEmergencyAlert(null);
      }
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSidebarOpen(false);
  };

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const currentReport = reports[activeReportIndex] || null;

  const navItems = [
    { key: 'dashboard', icon: <Activity size={18} />, label: t('nav_dashboard') },
    { key: 'history', icon: <FileText size={18} />, label: `${t('nav_history')} (${reports.length})` },
    { key: 'recommendations', icon: <Sparkles size={18} />, label: t('nav_recommendations') },
    { key: 'chatbot',    icon: <MessageSquare size={18} />, label: t('nav_chatbot') },
    { key: 'medication', icon: <Pill size={18} />,          label: t('nav_medication') },
    { key: 'profile',    icon: <User size={18} />,          label: t('nav_profile') },
    { key: 'settings',   icon: <Settings size={18} />,      label: t('nav_settings') },
  ];

  const tabTitles = {
    dashboard: 'Clinical Diagnostics Dashboard',
    history: t('nav_history'),
    recommendations: t('nav_recommendations'),
    chatbot:    t('nav_chatbot'),
    medication: t('nav_medication'),
    profile:    t('nav_profile'),
    settings:   t('nav_settings_title'),
  };

  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={(user) => {
          sessionStorage.setItem('aura_user', JSON.stringify(user));
          sessionStorage.setItem('aura_has_started', 'true');
          setHasStarted(true);
          setIsLoggedIn(true);
        }}
        lang={lang}
        t={t}
      />
    );
  }

  if (!hasStarted) {
    return <LandingPage onEnter={() => setHasStarted(true)} lang={lang} t={t} />;
  }

  return (
    <div className="flex min-h-screen bg-darkBg text-slate-800 transition-colors duration-300 dark:text-slate-100">
      <AlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        criticalBiomarkers={criticalBiomarkers}
        mlAnomalies={mlAnomalies}
        emergencyAlert={emergencyAlert}
        setActiveTab={handleTabChange}
        t={t}
      />
      <VoiceAssistant report={currentReport} isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} t={t} />
      <ReportComparison reports={reports} isOpen={compareOpen} onClose={() => setCompareOpen(false)} t={t} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-slate-200/60 bg-white/90 shadow-soft backdrop-blur-xl transition-transform duration-300 dark:border-white/8 dark:bg-[#0a1220]/95 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="flex items-center justify-between border-b border-slate-200/60 p-5 dark:border-white/8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 p-2.5 text-white shadow-glow-teal">
                <Activity size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h1 className="font-display text-base font-bold tracking-wide text-slate-900 dark:text-white">AURA MED</h1>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">AI Clinical Analyzer</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden" aria-label="Close menu">
              <X size={18} />
            </button>
          </div>

          <div className="relative px-4 pt-4 pb-2">
            <button
              onClick={() => setLangMenuOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200/60 bg-slate-50/80 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-blue-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              <span className="flex items-center gap-2">
                <Globe size={13} className="text-blue-500" />
                {currentLang.flag} {currentLang.nativeLabel}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{t('lang_select')}</span>
            </button>
            {langMenuOpen && (
              <div className="absolute left-4 right-4 top-full z-50 mt-1.5 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900">
                {LANGUAGES.map((lng) => (
                  <button
                    key={lng.code}
                    onClick={() => { setLang(lng.code); setLangMenuOpen(false); }}
                    className={`flex w-full items-center gap-2.5 px-4 py-3 text-xs font-semibold transition hover:bg-slate-50 dark:hover:bg-white/5 ${lang === lng.code ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    <span>{lng.flag}</span>
                    <span>{lng.nativeLabel}</span>
                    <span className="font-normal text-slate-400">({lng.label})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <nav className="space-y-1 p-4" aria-label="Main navigation">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleTabChange(item.key)}
                className={`nav-item ${activeTab === item.key ? 'nav-item-active' : 'nav-item-inactive'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="border-t border-slate-200/60 bg-slate-50/60 p-4 dark:border-white/8 dark:bg-black/20">
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{t('db_status')}</span>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'animate-pulse bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                {isConnected ? 'Connected' : t('offline_mode')}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white/80 px-3 py-3 dark:border-white/8 dark:bg-white/5">
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{userProfile.name}</p>
              <p className="text-[9px] font-medium uppercase text-slate-500">{userProfile.gender}, {userProfile.age} yrs</p>
            </div>
            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
              BMI {userProfile.bmi}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/60 bg-white/75 px-4 backdrop-blur-xl sm:h-[4.5rem] sm:px-6 lg:px-8 dark:border-white/8 dark:bg-[#0a1220]/80">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="btn-icon lg:hidden" aria-label="Open menu">
              <Menu size={18} />
            </button>
            <h2 className="font-display text-base font-bold tracking-tight text-slate-900 sm:text-lg dark:text-white">{tabTitles[activeTab]}</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setVoiceOpen(true)} title={t('header_voice_assistant')} className="btn-icon hidden sm:flex" aria-label="Voice assistant">
              <Mic size={16} />
            </button>
            <button onClick={() => setCompareOpen(true)} title={t('header_compare_reports')} className="btn-icon hidden sm:flex" aria-label="Compare reports">
              <GitCompare size={16} />
            </button>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="btn-icon" title={t('header_toggle_theme')} aria-label="Toggle theme">
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button
              onClick={() => { sessionStorage.removeItem('aura_user'); setIsLoggedIn(false); }}
              title={t('header_logout')}
              className="btn-icon hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
            <ReportUpload onUploadSuccess={handleUploadSuccess} lang={lang} t={t} />
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <Dashboard report={currentReport} reportsList={reports} lang={lang} t={t} setActiveTab={handleTabChange} setActiveReportIndex={setActiveReportIndex} />
          )}
          {activeTab === 'history' && (
            <ReportHistory
              reports={reports}
              activeReportIndex={activeReportIndex}
              setActiveReportIndex={setActiveReportIndex}
              t={t}
              onDeleteReport={(id) => {
                setReports((prev) => prev.filter((r) => r.id !== id));
                if (activeReportIndex >= reports.length - 1) setActiveReportIndex(Math.max(0, reports.length - 2));
              }}
            />
          )}
          {activeTab === 'recommendations' && <Recommendations report={currentReport} lang={lang} t={t} />}
          {activeTab === 'chatbot'    && <ChatBot report={currentReport} lang={lang} t={t} />}
          {activeTab === 'medication' && <MedicationReminder t={t} />}
          {activeTab === 'profile'    && <ProfilePage userProfile={userProfile} onUpdate={handleUpdateProfile} t={t} />}
          {activeTab === 'settings' && <SettingsPage settingsForm={settingsForm} setSettingsForm={setSettingsForm} theme={theme} setTheme={setTheme} lang={lang} setLang={setLang} t={t} />}
        </div>
      </main>
    </div>
  );
}

export default App;
