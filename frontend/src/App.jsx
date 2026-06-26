import React, { useState, useEffect } from 'react';
import {
  Activity, FileText, MessageSquare, User, Sparkles, Globe
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import ReportUpload from './components/ReportUpload';
import Recommendations from './components/Recommendations';
import ChatBot from './components/ChatBot';
import RiskPredictor from './components/RiskPredictor';
import ReportHistory from './components/ReportHistory';
import AlertModal from './components/AlertModal';

import { DEFAULT_PROFILE, MOCK_REPORTS } from './utils/mockData';
import { LANGUAGES, useTranslation } from './utils/translations';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lang, setLang] = useState(() => localStorage.getItem('aura_lang') || 'en');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(DEFAULT_PROFILE);
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [activeReportIndex, setActiveReportIndex] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  
  // Alert Modal State
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [criticalBiomarkers, setCriticalBiomarkers] = useState([]);
  const [mlAnomalies, setMlAnomalies] = useState([]);

  const t = useTranslation(lang);

  // Persist language selection
  useEffect(() => {
    localStorage.setItem('aura_lang', lang);
  }, [lang]);

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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (r.ok) { setUserProfile(await r.json()); fetchReports(); }
    } catch { /* offline */ }
  };

  const handleUploadSuccess = (newReport) => {
    setReports(prev => [newReport, ...prev]);
    setActiveReportIndex(0);
    setActiveTab('dashboard');
    setIsConnected(true);

    // Check for anomalies to trigger AlertModal
    if (newReport && newReport.biomarkers) {
      const critical = newReport.biomarkers.filter(b => b.status === 'High' || b.status === 'Low');
      const ml = newReport.biomarkers.filter(b => b.is_trend_anomaly);
      
      if (critical.length > 0 || ml.length > 0) {
        setCriticalBiomarkers(critical);
        setMlAnomalies(ml);
        setAlertModalOpen(true);
      }
    }
  };

  const handleLangChange = (code) => {
    setLang(code);
    setLangMenuOpen(false);
  };

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
  const currentReport = reports[activeReportIndex] || null;

  const navItems = [
    { key: 'dashboard', icon: <Activity size={18} />, label: t('nav_dashboard') },
    { key: 'history', icon: <FileText size={18} />, label: `${t('nav_history')} (${reports.length})` },
    { key: 'recommendations', icon: <Sparkles size={18} />, label: t('nav_recommendations') },
    { key: 'chatbot', icon: <MessageSquare size={18} />, label: t('nav_chatbot') },
    { key: 'profile', icon: <User size={18} />, label: t('nav_profile') },
  ];

  const tabTitles = {
    dashboard: 'Clinical Diagnostics Dashboard',
    history: t('nav_history'),
    recommendations: t('nav_recommendations'),
    chatbot: t('nav_chatbot'),
    profile: t('nav_profile'),
  };

  return (
    <div className="flex min-h-screen bg-darkBg text-slate-100">
      
      <AlertModal 
        isOpen={alertModalOpen} 
        onClose={() => setAlertModalOpen(false)} 
        criticalBiomarkers={criticalBiomarkers}
        mlAnomalies={mlAnomalies}
        setActiveTab={setActiveTab}
      />

      {/* Sidebar */}
      <aside className="w-64 border-r border-darkCardBorder bg-[#0D1424] flex flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="p-6 border-b border-darkCardBorder flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-neonCyan to-neonTeal p-2 rounded-xl text-darkBg shadow-glow-cyan">
              <Activity size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight tracking-wider bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                {t('app_name')}
              </h1>
              <p className="text-[10px] text-neonCyan font-bold tracking-widest uppercase">
                {t('app_tagline')}
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="px-4 pt-4 pb-2 relative">
            <button
              onClick={() => setLangMenuOpen(v => !v)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/5 hover:border-neonCyan/30 transition-all text-xs font-bold text-slate-300"
            >
              <span className="flex items-center space-x-2">
                <Globe size={13} className="text-neonCyan" />
                <span>{currentLang.flag} {currentLang.nativeLabel}</span>
              </span>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest">{t('lang_select')}</span>
            </button>
            {langMenuOpen && (
              <div className="absolute left-4 right-4 top-full mt-1 z-50 bg-[#0D1424] border border-darkCardBorder rounded-xl shadow-xl overflow-hidden">
                {LANGUAGES.map(lng => (
                  <button
                    key={lng.code}
                    onClick={() => handleLangChange(lng.code)}
                    className={`w-full flex items-center space-x-2 px-4 py-2.5 text-xs font-bold transition-all hover:bg-white/5 ${
                      lang === lng.code ? 'text-neonCyan bg-neonCyan/10' : 'text-slate-300'
                    }`}
                  >
                    <span className="text-base">{lng.flag}</span>
                    <span>{lng.nativeLabel}</span>
                    <span className="text-slate-500">({lng.label})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === item.key
                    ? 'bg-gradient-to-r from-neonCyan/20 to-neonIndigo/10 border-l-4 border-neonCyan text-white shadow-glow-cyan'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer: DB Status + Mini Profile */}
        <div className="p-4 border-t border-darkCardBorder bg-[#090E1A]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{t('db_status')}</span>
            <div className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-neonTeal animate-pulse' : 'bg-neonWarning'}`}></span>
              <span className="text-[11px] font-bold text-slate-300">
                {isConnected ? 'Postgres/SQLite' : t('offline_mode')}
              </span>
            </div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg flex items-center justify-between border border-white/5">
            <div>
              <p className="text-xs font-bold text-white truncate max-w-[120px]">{userProfile.name}</p>
              <p className="text-[10px] text-slate-400">{userProfile.gender}, {userProfile.age} yrs</p>
            </div>
            <div className="bg-neonIndigo/20 text-neonIndigo font-extrabold text-[10px] px-2 py-1 rounded border border-neonIndigo/30">
              BMI {userProfile.bmi}
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-darkCardBorder bg-[#0D1424]/50 backdrop-blur-md px-8 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-white tracking-wide">{tabTitles[activeTab]}</h2>
          <ReportUpload onUploadSuccess={handleUploadSuccess} lang={lang} t={t} />
        </header>

        <div className="flex-1 p-8">
          {activeTab === 'dashboard' && (
            <Dashboard report={currentReport} reportsList={reports} lang={lang} t={t}
              setActiveTab={setActiveTab} setActiveReportIndex={setActiveReportIndex} />
          )}
          {activeTab === 'history' && (
            <ReportHistory reports={reports} activeReportIndex={activeReportIndex}
              setActiveReportIndex={setActiveReportIndex} t={t}
              onDeleteReport={(id) => {
                setReports(prev => prev.filter(r => r.id !== id));
                if (activeReportIndex >= reports.length - 1) setActiveReportIndex(Math.max(0, reports.length - 2));
              }} />
          )}
          {activeTab === 'recommendations' && <Recommendations report={currentReport} lang={lang} t={t} />}
          {activeTab === 'chatbot' && <ChatBot report={currentReport} lang={lang} t={t} />}

          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto glass-panel p-8 rounded-2xl border border-darkCardBorder">
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-neonCyan to-neonTeal bg-clip-text text-transparent">
                {t('profile_title')}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                const get = k => fd.get(k);
                const h = parseFloat(get('height')), w = parseFloat(get('weight'));
                handleUpdateProfile({
                  name: get('name'), age: parseInt(get('age')), gender: get('gender'),
                  height: h, weight: w, bmi: parseFloat((w / ((h / 100) ** 2)).toFixed(1)),
                  smoking: get('smoking') === 'true', exercise: get('exercise') === 'true',
                  family_history_diabetes: get('fhd') === 'true',
                  family_history_heart: get('fhh') === 'true'
                });
                alert(lang === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट हुई!' :
                      lang === 'ta' ? 'சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!' :
                      lang === 'pa' ? 'ਪ੍ਰੋਫਾਈਲ ਸਫਲਤਾਪੂਰਵਕ ਅੱਪਡੇਟ ਹੋਈ!' :
                      'Health profile updated successfully!');
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[['name','text',t('label_name'),userProfile.name],['age','number',t('label_age'),userProfile.age]].map(([n,type,label,def])=>(
                    <div key={n}>
                      <label className="block text-xs text-slate-400 font-bold mb-1 uppercase">{label}</label>
                      <input name={n} type={type} defaultValue={def} required className="w-full bg-[#0B0F19] border border-darkCardBorder rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neonCyan" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-bold mb-1 uppercase">{t('label_gender')}</label>
                    <select name="gender" defaultValue={userProfile.gender} className="w-full bg-[#0B0F19] border border-darkCardBorder rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neonCyan">
                      <option value="Male">{t('opt_male')}</option>
                      <option value="Female">{t('opt_female')}</option>
                      <option value="Other">{t('opt_other')}</option>
                    </select>
                  </div>
                  {[['height',t('label_height'),userProfile.height],['weight',t('label_weight'),userProfile.weight]].map(([n,label,def])=>(
                    <div key={n}>
                      <label className="block text-xs text-slate-400 font-bold mb-1 uppercase">{label}</label>
                      <input name={n} type="number" step="0.1" defaultValue={def} required className="w-full bg-[#0B0F19] border border-darkCardBorder rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neonCyan" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[['smoking',t('label_smoking'),userProfile.smoking],['exercise',t('label_exercise'),userProfile.exercise]].map(([n,label,def])=>(
                    <div key={n}>
                      <label className="block text-xs text-slate-400 font-bold mb-1 uppercase">{label}</label>
                      <select name={n} defaultValue={String(def)} className="w-full bg-[#0B0F19] border border-darkCardBorder rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neonCyan">
                        <option value="true">{t('opt_yes')}</option>
                        <option value="false">{n === 'exercise' ? t('opt_sedentary') : t('opt_no')}</option>
                      </select>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[['fhd',t('label_fam_diabetes'),userProfile.family_history_diabetes],['fhh',t('label_fam_heart'),userProfile.family_history_heart]].map(([n,label,def])=>(
                    <div key={n}>
                      <label className="block text-xs text-slate-400 font-bold mb-1 uppercase">{label}</label>
                      <select name={n} defaultValue={String(def)} className="w-full bg-[#0B0F19] border border-darkCardBorder rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neonCyan">
                        <option value="false">{t('opt_no')}</option>
                        <option value="true">{t('opt_yes')}</option>
                      </select>
                    </div>
                  ))}
                </div>
                <button type="submit" className="w-full mt-6 bg-gradient-to-r from-neonCyan to-neonIndigo text-darkBg font-bold py-3 rounded-lg hover:opacity-90 transition-all text-sm uppercase tracking-wider">
                  {t('btn_save_profile')}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
