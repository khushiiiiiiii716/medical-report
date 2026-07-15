import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Pill, Plus, Trash2, Bell, BellOff, Clock, Check,
  AlarmClock, X, Edit3, Save, ChevronDown
} from 'lucide-react';

// ── Frequency options ────────────────────────────────────────────────────────
const FREQUENCIES = [
  { value: 'once',      label: 'Once a day' },
  { value: 'twice',     label: 'Twice a day' },
  { value: 'thrice',    label: 'Three times a day' },
  { value: 'custom',    label: 'Custom times' },
];

const MEAL_OPTIONS = [
  { value: 'before',  label: 'Before meal' },
  { value: 'after',   label: 'After meal' },
  { value: 'with',    label: 'With meal' },
  { value: 'anytime', label: 'Anytime' },
];

const MED_COLORS = [
  '#3B82F6','#10B981','#F59E0B','#EF4444',
  '#8B5CF6','#EC4899','#06B6D4','#F97316',
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function generateId() {
  return `med_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function defaultTimes(freq) {
  if (freq === 'once')   return ['08:00'];
  if (freq === 'twice')  return ['08:00', '20:00'];
  if (freq === 'thrice') return ['08:00', '14:00', '20:00'];
  return ['08:00'];
}

function formatTime12(time24) {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function minutesUntil(time24) {
  const now  = new Date();
  const [h, m] = time24.split(':').map(Number);
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return Math.round((target - now) / 60000);
}

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; }
    catch { return init; }
  });
  const set = useCallback((v) => {
    setVal((prev) => {
      const next = typeof v === 'function' ? v(prev) : v;
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [key]);
  return [val, set];
}

// ── Add / Edit form ──────────────────────────────────────────────────────────
function MedForm({ initial, onSave, onCancel, t }) {
  const [name,     setName]     = useState(initial?.name     || '');
  const [dose,     setDose]     = useState(initial?.dose     || '');
  const [freq,     setFreq]     = useState(initial?.freq     || 'once');
  const [times,    setTimes]    = useState(initial?.times    || ['08:00']);
  const [meal,     setMeal]     = useState(initial?.meal     || 'anytime');
  const [notes,    setNotes]    = useState(initial?.notes    || '');
  const [color,    setColor]    = useState(initial?.color    || MED_COLORS[0]);
  const [duration, setDuration] = useState(initial?.duration || '');

  const handleFreqChange = (f) => {
    setFreq(f);
    if (f !== 'custom') setTimes(defaultTimes(f));
  };

  const updateTime = (i, v) => setTimes((prev) => prev.map((t, idx) => idx === i ? v : t));
  const addTime    = () => setTimes((prev) => [...prev, '12:00']);
  const removeTime = (i) => setTimes((prev) => prev.filter((_, idx) => idx !== i));

  const valid = name.trim() && times.length > 0;

  return (
    <div className="soft-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="font-display font-bold text-slate-900 dark:text-white text-base">
          {initial ? t('med_edit') : t('med_add_new')}
        </h4>
        <button onClick={onCancel} className="btn-icon"><X size={16} /></button>
      </div>

      {/* Name + dose */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="section-label mb-1.5 block">{t('med_name')} *</label>
          <input className="input-field" placeholder={t('med_name_placeholder')}
            value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="section-label mb-1.5 block">{t('med_dose')}</label>
          <input className="input-field" placeholder="e.g. 500mg, 1 tablet"
            value={dose} onChange={(e) => setDose(e.target.value)} />
        </div>
      </div>

      {/* Frequency */}
      <div>
        <label className="section-label mb-1.5 block">{t('med_frequency')}</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FREQUENCIES.map((f) => (
            <button key={f.value} type="button"
              onClick={() => handleFreqChange(f.value)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                freq === f.value
                  ? 'border-blue-500 bg-blue-500 text-white shadow-md'
                  : 'border-slate-200/80 bg-white dark:border-white/10 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:border-blue-300'
              }`}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Times */}
      <div>
        <label className="section-label mb-1.5 block">{t('med_times')}</label>
        <div className="flex flex-wrap gap-2 items-center">
          {times.map((ti, i) => (
            <div key={i} className="flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 px-2 py-1">
              <Clock size={12} className="text-blue-500 shrink-0" />
              <input type="time" value={ti} onChange={(e) => updateTime(i, e.target.value)}
                className="bg-transparent text-xs font-mono font-bold text-slate-900 dark:text-white outline-none w-20" />
              {times.length > 1 && (
                <button onClick={() => removeTime(i)} className="text-slate-400 hover:text-rose-500 transition ml-1">
                  <X size={11} />
                </button>
              )}
            </div>
          ))}
          {freq === 'custom' && (
            <button onClick={addTime} className="flex items-center gap-1 rounded-xl border border-dashed border-blue-300 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition">
              <Plus size={12} /> Add time
            </button>
          )}
        </div>
      </div>

      {/* Meal + Duration */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="section-label mb-1.5 block">{t('med_meal')}</label>
          <div className="relative">
            <select value={meal} onChange={(e) => setMeal(e.target.value)}
              className="input-field appearance-none pr-8 text-xs">
              {MEAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
        <div>
          <label className="section-label mb-1.5 block">{t('med_duration')}</label>
          <input className="input-field text-xs" placeholder="e.g. 7 days, 1 month"
            value={duration} onChange={(e) => setDuration(e.target.value)} />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="section-label mb-1.5 block">{t('med_notes')}</label>
        <textarea rows={2} className="input-field resize-none text-xs" placeholder={t('med_notes_placeholder')}
          value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      {/* Colour picker */}
      <div>
        <label className="section-label mb-1.5 block">{t('med_color')}</label>
        <div className="flex gap-2 flex-wrap">
          {MED_COLORS.map((c) => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="btn-secondary flex-1">{t('btn_cancel')}</button>
        <button onClick={() => valid && onSave({ name: name.trim(), dose, freq, times, meal, notes, color, duration })}
          disabled={!valid}
          className="btn-primary flex-1 disabled:opacity-40">
          <Save size={14} />
          {initial ? t('med_save_changes') : t('med_add_medicine')}
        </button>
      </div>
    </div>
  );
}

// ── Single medicine card ─────────────────────────────────────────────────────
function MedCard({ med, onEdit, onDelete, onToggleTaken, takenToday, t }) {
  const nextTime = med.times
    .map((ti) => ({ ti, mins: minutesUntil(ti) }))
    .sort((a, b) => a.mins - b.mins)[0];

  const urgent = nextTime && nextTime.mins <= 30;
  const mealLabel = MEAL_OPTIONS.find((o) => o.value === med.meal)?.label || '';

  return (
    <div className={`relative overflow-hidden rounded-3xl border bg-white dark:bg-[#141f33] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
      urgent ? 'border-amber-300 dark:border-amber-700/60 shadow-amber-100 dark:shadow-amber-900/20'
             : 'border-slate-200/60 dark:border-white/8'
    }`}>
      {/* Colour stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-3xl" style={{ backgroundColor: med.color }} />

      <div className="flex items-start justify-between gap-3 p-4 pl-5">
        <div className="flex items-start gap-3 min-w-0">
          {/* Icon */}
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: med.color + '20' }}>
            <Pill size={18} style={{ color: med.color }} />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{med.name}</h4>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
              {med.dose && <span className="text-[10px] font-semibold text-slate-500">{med.dose}</span>}
              {med.dose && med.meal !== 'anytime' && <span className="text-slate-300 dark:text-slate-600">·</span>}
              {med.meal !== 'anytime' && <span className="text-[10px] text-slate-500">{mealLabel}</span>}
              {med.duration && <><span className="text-slate-300 dark:text-slate-600">·</span><span className="text-[10px] text-slate-500">{med.duration}</span></>}
            </div>
            {/* Times row */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {med.times.map((ti) => {
                const isTaken = takenToday.includes(ti);
                const isNext  = ti === nextTime?.ti;
                return (
                  <button key={ti} onClick={() => onToggleTaken(med.id, ti)}
                    title={isTaken ? 'Mark as not taken' : 'Mark as taken'}
                    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold transition-all ${
                      isTaken
                        ? 'border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : isNext && urgent
                        ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-400 animate-pulse'
                        : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 hover:border-blue-300'
                    }`}>
                    {isTaken ? <Check size={9} /> : <Clock size={9} />}
                    {formatTime12(ti)}
                  </button>
                );
              })}
            </div>
            {med.notes && <p className="mt-1.5 text-[10px] italic text-slate-400">{med.notes}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <button onClick={() => onEdit(med)} className="btn-icon !h-7 !w-7" title="Edit"><Edit3 size={13} /></button>
          <button onClick={() => onDelete(med.id)}
            className="btn-icon !h-7 !w-7 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30" title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Next dose banner */}
      {nextTime && !takenToday.includes(nextTime.ti) && (
        <div className={`flex items-center gap-2 border-t px-5 py-2 text-[10px] font-semibold ${
          urgent
            ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/30 dark:bg-amber-950/20 dark:text-amber-400'
            : 'border-slate-100 bg-slate-50/60 text-slate-500 dark:border-white/5 dark:bg-white/3'
        }`}>
          <AlarmClock size={11} className={urgent ? 'text-amber-500' : 'text-slate-400'} />
          {urgent
            ? `⚡ Due in ${nextTime.mins} min — ${formatTime12(nextTime.ti)}`
            : `Next dose: ${formatTime12(nextTime.ti)} (in ${nextTime.mins} min)`}
        </div>
      )}
    </div>
  );
}

// ── Toast notification ────────────────────────────────────────────────────────
function Toast({ toasts, dismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id}
          className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-emerald-200 bg-white dark:bg-[#141f33] dark:border-emerald-800/40 px-4 py-3 shadow-xl animate-fade-in-up max-w-xs">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/40">
            <Bell size={15} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 dark:text-white">{toast.title}</p>
            <p className="text-[10px] text-slate-500">{toast.body}</p>
          </div>
          <button onClick={() => dismiss(toast.id)} className="text-slate-400 hover:text-slate-600 mt-0.5">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Main MedicationReminder component ────────────────────────────────────────
function MedicationReminder({ t }) {
  const [meds,      setMeds]      = useLocalStorage('aura_meds', []);
  const [takenMap,  setTakenMap]  = useLocalStorage('aura_meds_taken', {});
  const [showForm,  setShowForm]  = useState(false);
  const [editMed,   setEditMed]   = useState(null);
  const [notifPerm, setNotifPerm] = useState(Notification.permission);
  const [toasts,    setToasts]    = useState([]);
  const [now,       setNow]       = useState(new Date());
  const notifiedRef = useRef(new Set());

  // Live clock — tick every 30s
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  // Reset taken map at midnight
  useEffect(() => {
    const today = new Date().toDateString();
    setTakenMap((prev) => {
      const cleaned = {};
      Object.entries(prev).forEach(([k, v]) => {
        if (v.date === today) cleaned[k] = v;
      });
      return cleaned;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check reminders every 30s
  useEffect(() => {
    const check = () => {
      const n = new Date();
      const hh = String(n.getHours()).padStart(2,'0');
      const mm = String(n.getMinutes()).padStart(2,'0');
      const current = `${hh}:${mm}`;
      const today = n.toDateString();

      meds.forEach((med) => {
        med.times.forEach((ti) => {
          const key = `${med.id}_${ti}_${today}`;
          const taken = takenMap[`${med.id}_${ti}`]?.date === today;
          if (taken || notifiedRef.current.has(key)) return;

          const [th, tm] = ti.split(':').map(Number);
          const diff = (th * 60 + tm) - (n.getHours() * 60 + n.getMinutes());

          if (diff === 0 || diff === -1) {
            notifiedRef.current.add(key);
            const title = `💊 Time to take ${med.name}`;
            const body  = `${med.dose ? med.dose + ' · ' : ''}${formatTime12(ti)}${med.meal !== 'anytime' ? ' · ' + MEAL_OPTIONS.find(o=>o.value===med.meal)?.label : ''}`;
            // Browser notification
            if (Notification.permission === 'granted') {
              new Notification(title, { body, icon: '/favicon.svg', tag: key });
            }
            // In-app toast
            const toastId = generateId();
            setToasts((prev) => [...prev, { id: toastId, title, body }]);
            setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toastId)), 8000);
          }
        });
      });
    };

    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [meds, takenMap]);

  const requestNotifPermission = async () => {
    const p = await Notification.requestPermission();
    setNotifPerm(p);
  };

  const addMed = (data) => {
    setMeds((prev) => [...prev, { id: generateId(), ...data, active: true }]);
    setShowForm(false);
  };

  const saveMed = (data) => {
    setMeds((prev) => prev.map((m) => m.id === editMed.id ? { ...m, ...data } : m));
    setEditMed(null);
  };

  const deleteMed = (id) => {
    setMeds((prev) => prev.filter((m) => m.id !== id));
  };

  const toggleTaken = (medId, time) => {
    const key   = `${medId}_${time}`;
    const today = new Date().toDateString();
    setTakenMap((prev) => {
      const existing = prev[key];
      if (existing?.date === today) {
        const next = { ...prev }; delete next[key]; return next;
      }
      return { ...prev, [key]: { date: today } };
    });
  };

  const getTakenToday = (medId) => {
    const today = new Date().toDateString();
    return Object.entries(takenMap)
      .filter(([k, v]) => k.startsWith(medId + '_') && v.date === today)
      .map(([k]) => k.replace(medId + '_', ''));
  };

  // Stats
  const totalDoses   = meds.reduce((s, m) => s + m.times.length, 0);
  const takenToday   = Object.values(takenMap).filter((v) => v.date === new Date().toDateString()).length;
  const pendingToday = Math.max(0, totalDoses - takenToday);

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in-up pb-10">
      <Toast toasts={toasts} dismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />

      {/* Header */}
      <div className="soft-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-3 text-white shadow-lg">
              <Pill size={22} />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">{t('med_title')}</h3>
              <p className="text-xs text-slate-500">{t('med_subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifPerm !== 'granted' && (
              <button onClick={requestNotifPermission}
                className="flex items-center gap-1.5 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] font-bold text-amber-700 hover:bg-amber-100 transition dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-400">
                <BellOff size={13} /> {t('med_enable_notif')}
              </button>
            )}
            {notifPerm === 'granted' && (
              <span className="flex items-center gap-1.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-400">
                <Bell size={12} /> {t('med_notif_on')}
              </span>
            )}
            <button onClick={() => { setEditMed(null); setShowForm(true); }}
              className="btn-primary px-4 py-2 text-xs">
              <Plus size={14} /> {t('med_add')}
            </button>
          </div>
        </div>

        {/* Stats row */}
        {meds.length > 0 && (
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: t('med_stat_total'), value: meds.length, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
              { label: t('med_stat_taken'), value: takenToday, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
              { label: t('med_stat_pending'), value: pendingToday, color: pendingToday > 0 ? 'text-amber-600' : 'text-slate-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl ${s.bg} p-3 text-center`}>
                <div className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit form */}
      {(showForm || editMed) && (
        <MedForm
          initial={editMed}
          onSave={editMed ? saveMed : addMed}
          onCancel={() => { setShowForm(false); setEditMed(null); }}
          t={t}
        />
      )}

      {/* Today's schedule */}
      {meds.length > 0 && (
        <div className="soft-card p-6">
          <div className="mb-4 flex items-center gap-2 section-label">
            <AlarmClock size={14} className="text-violet-500" />
            {t('med_todays_schedule')}
          </div>
          <div className="space-y-1.5">
            {meds
              .flatMap((m) => m.times.map((ti) => ({ med: m, time: ti })))
              .sort((a, b) => a.time.localeCompare(b.time))
              .map(({ med, time }) => {
                const key     = `${med.id}_${time}`;
                const isTaken = takenMap[key]?.date === new Date().toDateString();
                const mins    = minutesUntil(time);
                const isNow   = mins <= 30 && !isTaken;
                return (
                  <button key={key} onClick={() => toggleTaken(med.id, time)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                      isTaken
                        ? 'border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-950/20 opacity-70'
                        : isNow
                        ? 'border-amber-300 bg-amber-50 dark:border-amber-700/50 dark:bg-amber-950/20 shadow-sm'
                        : 'border-slate-200/60 bg-white dark:border-white/8 dark:bg-white/3 hover:border-violet-300'
                    }`}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: med.color + (isTaken ? '30' : '20') }}>
                      {isTaken
                        ? <Check size={15} style={{ color: '#10B981' }} />
                        : <Pill size={15} style={{ color: med.color }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold ${isTaken ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {med.name} {med.dose && <span className="font-normal text-slate-500">— {med.dose}</span>}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {formatTime12(time)}{med.meal !== 'anytime' ? ` · ${MEAL_OPTIONS.find(o=>o.value===med.meal)?.label}` : ''}
                      </p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold ${
                      isTaken ? 'text-emerald-600 dark:text-emerald-400' : isNow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
                    }`}>
                      {isTaken ? '✓ Taken' : isNow ? `${mins}m` : formatTime12(time)}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Medicine list */}
      {meds.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 section-label px-1">
            <Pill size={13} className="text-violet-500" />
            {t('med_all_medicines')} ({meds.length})
          </div>
          {meds.map((med) => (
            <MedCard key={med.id} med={med} t={t}
              takenToday={getTakenToday(med.id)}
              onEdit={(m) => { setEditMed(m); setShowForm(false); }}
              onDelete={deleteMed}
              onToggleTaken={toggleTaken}
            />
          ))}
        </div>
      ) : !showForm && (
        <div className="soft-card flex flex-col items-center gap-4 py-16 text-center">
          <div className="text-5xl">💊</div>
          <h4 className="font-display text-lg font-bold text-slate-700 dark:text-slate-200">{t('med_empty_title')}</h4>
          <p className="max-w-sm text-xs text-slate-500 leading-relaxed">{t('med_empty_sub')}</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-2">
            <Plus size={15} /> {t('med_add_first')}
          </button>
        </div>
      )}
    </div>
  );
}

export default MedicationReminder;
