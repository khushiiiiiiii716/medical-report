import React, { useState } from 'react';
import { Activity, Eye, EyeOff, Lock, User, AlertCircle, Leaf, ShieldCheck, Heart, Zap, ArrowRight } from 'lucide-react';

const DEMO_CREDENTIALS = { username: 'doctor', password: 'aura2024' };

function LoginPage({ onLogin, t }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 850));
    if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
      onLogin({ name: 'Dr. Aura', username });
    } else {
      setError('Incorrect username or password. Use demo credentials below.');
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen font-sans">
      {/* Brand panel */}
      <div className="relative hidden w-[55%] flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-emerald-950 p-12 text-white lg:flex xl:p-16">
        <div className="pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-blue-500/15 blur-[100px]" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-md">
            <Activity size={24} className="text-emerald-400" />
          </div>
          <div>
            <span className="font-display text-xl font-bold tracking-wide">AURA MED</span>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">AI Clinical Suite</div>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <ShieldCheck size={14} />
            HIPAA Compliant Secure Platform
          </div>

          <h1 className="font-display text-5xl font-bold leading-[1.1]">
            AI-powered{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              medical intelligence
            </span>
          </h1>

          <p className="text-lg leading-relaxed text-slate-300">
            Translate complex lab results and diagnostic profiles into clear, actionable health insights in seconds.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Zap, title: 'Instant Diagnostics', desc: 'Multi-stage OCR & ML analysis', color: 'text-emerald-400' },
              { icon: Heart, title: 'Personalized Care', desc: 'Chatbot & voice assistant', color: 'text-blue-400' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition hover:bg-white/[0.07]">
                <item.icon className={`mb-2 ${item.color}`} size={20} />
                <div className="text-sm font-bold">{item.title}</div>
                <div className="mt-1 text-xs text-slate-400">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
          <span>© 2026 Aura Med Systems</span>
          <span className="flex items-center gap-1.5"><Leaf size={12} className="text-emerald-400" />Carbon-Neutral</span>
        </div>
      </div>

      {/* Login form */}
      <div className="relative flex w-full items-center justify-center bg-[linear-gradient(160deg,#f0f7ff_0%,#f0fdf4_100%)] p-6 dark:bg-[#060d18] sm:p-10 lg:w-[45%]">
        <div className="pointer-events-none absolute right-[10%] top-[10%] h-64 w-64 rounded-full bg-blue-500/5 blur-[80px]" />
        <div className="pointer-events-none absolute bottom-[10%] left-[10%] h-64 w-64 rounded-full bg-emerald-500/5 blur-[80px]" />

        <div className="relative w-full max-w-md animate-fade-in-up">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 p-2.5 text-white shadow-glow-teal">
                <Activity size={22} />
              </div>
              <div>
                <span className="font-display text-xl font-bold text-slate-900 dark:text-white">AURA MED</span>
                <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">AI Clinical Suite</div>
              </div>
            </div>
          </div>

          <div className="soft-card p-8">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Clinical Portal</h2>
            <p className="mt-2 text-sm text-slate-500">Sign in with your healthcare credentials</p>

            {error && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400" role="alert">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Clinical Username</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="e.g. doctor" value={username} onChange={(e) => setUsername(e.target.value)} required className="input-field pl-11" autoComplete="username" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Access Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field pl-11 pr-11" autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={showPass ? 'Hide password' : 'Show password'}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/50 p-3 dark:border-white/8 dark:bg-white/3">
                <span className="text-xs font-medium text-slate-500">Demo credentials</span>
                <div className="flex items-center gap-2">
                  <code className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-blue-600 dark:border-white/10 dark:bg-white/5">doctor</code>
                  <span className="text-slate-300">/</span>
                  <code className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-blue-600 dark:border-white/10 dark:bg-white/5">aura2024</code>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-4">
                {loading ? (
                  <><div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />Authorizing…</>
                ) : (
                  <><Lock size={16} />Secure Access Login</>
                )}
              </button>
            </form>

            <div className="relative my-6 flex items-center">
              <div className="flex-1 border-t border-slate-200 dark:border-white/8" />
              <span className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">or</span>
              <div className="flex-1 border-t border-slate-200 dark:border-white/8" />
            </div>

            <button onClick={() => onLogin({ name: 'Guest', username: 'guest' })} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 transition hover:border-emerald-500 hover:bg-emerald-50/30 hover:text-emerald-600 dark:border-white/10 dark:text-slate-400 dark:hover:border-emerald-500/50 dark:hover:text-emerald-400">
              Continue as Guest
              <ArrowRight size={14} />
            </button>

            <p className="mt-6 text-center text-[10px] text-slate-400">Encrypted · HIPAA Compliant · Privacy Guaranteed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
