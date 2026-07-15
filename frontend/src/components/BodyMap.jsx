import React, { useState } from 'react';
import { X, Activity, AlertCircle, ShieldCheck, Pill, ChevronRight } from 'lucide-react';

// ── Organ knowledge base ─────────────────────────────────────────────────────
const ORGAN_DATA = {
  brain: {
    label: 'Brain',
    emoji: '🧠',
    color: '#8B5CF6',
    biomarkerKeys: ['Systolic BP', 'Diastolic BP', 'Total Cholesterol', 'LDL Cholesterol'],
    riskKeys: ['heart_disease'],
    symptoms: [
      'Persistent headaches or migraines',
      'Dizziness or loss of balance',
      'Memory lapses or confusion',
      'Blurred or double vision',
      'Numbness or tingling in limbs',
    ],
    prevention: [
      'Keep blood pressure below 120/80 mmHg',
      'Limit sodium to under 1,500 mg/day',
      'Practice mindfulness and stress reduction',
      'Aim for 7–9 hours of quality sleep nightly',
      'Stay mentally active — read, puzzle, learn',
    ],
    treatment: [
      'Antihypertensives if BP is consistently high',
      'Statins to lower LDL and protect vessels',
      'Regular neurological check-ups if symptomatic',
      'Physiotherapy for balance or coordination issues',
    ],
  },
  heart: {
    label: 'Heart',
    emoji: '❤️',
    color: '#EF4444',
    biomarkerKeys: ['Total Cholesterol', 'LDL Cholesterol', 'HDL Cholesterol', 'Triglycerides', 'Systolic BP', 'Diastolic BP'],
    riskKeys: ['heart_disease'],
    symptoms: [
      'Chest tightness, pressure, or pain',
      'Shortness of breath at rest or on exertion',
      'Palpitations or irregular heartbeat',
      'Swollen ankles or feet (edema)',
      'Unusual fatigue or weakness',
    ],
    prevention: [
      'Maintain LDL < 100 mg/dL and HDL > 40 mg/dL',
      'Exercise 150 min/week of moderate cardio',
      'Quit smoking — it doubles cardiovascular risk',
      'Follow a Mediterranean or DASH diet',
      'Monitor blood pressure and lipids regularly',
    ],
    treatment: [
      'Statins (e.g. Atorvastatin) for high cholesterol',
      'Beta-blockers or ACE inhibitors for BP control',
      'Antiplatelet therapy (Aspirin) if prescribed',
      'Cardiac rehabilitation program post-event',
    ],
  },
  lungs: {
    label: 'Lungs',
    emoji: '🫁',
    color: '#06B6D4',
    biomarkerKeys: ['WBC', 'RBC', 'Hemoglobin'],
    riskKeys: ['anemia'],
    symptoms: [
      'Persistent cough or wheezing',
      'Shortness of breath on minimal exertion',
      'Reduced oxygen saturation (SpO₂ < 95%)',
      'Chest pain when breathing deeply',
      'Frequent respiratory infections',
    ],
    prevention: [
      'Avoid smoking and secondhand smoke',
      'Keep indoor air clean — use air purifiers',
      'Treat anaemia to improve oxygen delivery',
      'Annual flu vaccination',
      'Practice deep breathing exercises',
    ],
    treatment: [
      'Bronchodilators for airway obstruction',
      'Iron/B12 supplements if anaemia is driving low O₂',
      'Antibiotics for confirmed bacterial infections',
      'Pulmonologist referral for chronic symptoms',
    ],
  },
  liver: {
    label: 'Liver',
    emoji: '🟤',
    color: '#B45309',
    biomarkerKeys: ['Triglycerides', 'Total Cholesterol', 'LDL Cholesterol', 'Fasting Glucose', 'HbA1c'],
    riskKeys: ['diabetes'],
    symptoms: [
      'Fatigue and general weakness',
      'Abdominal pain or fullness (upper right)',
      'Yellowing of skin or eyes (jaundice)',
      'Dark urine or pale stools',
      'Unexplained weight loss',
    ],
    prevention: [
      'Limit alcohol to < 1–2 units/day',
      'Maintain a healthy weight (BMI 18.5–24.9)',
      'Avoid fatty/fried food to reduce triglycerides',
      'Control blood sugar to prevent fatty liver',
      'Hepatitis B vaccination if unvaccinated',
    ],
    treatment: [
      'Lifestyle modification for non-alcoholic fatty liver',
      'Metformin for insulin resistance',
      'Fibrates to lower triglycerides',
      'Hepatologist referral if enzymes are elevated',
    ],
  },
  kidney: {
    label: 'Kidneys',
    emoji: '🫘',
    color: '#F97316',
    biomarkerKeys: ['Creatinine', 'Systolic BP', 'Diastolic BP', 'Fasting Glucose', 'HbA1c'],
    riskKeys: ['diabetes'],
    symptoms: [
      'Reduced or foamy urine output',
      'Swelling in legs, ankles, or face',
      'Persistent high blood pressure',
      'Fatigue and loss of appetite',
      'Back or flank pain',
    ],
    prevention: [
      'Keep blood pressure below 130/80 mmHg',
      'Control diabetes — HbA1c < 7%',
      'Stay hydrated — 2–3 litres of water/day',
      'Avoid NSAIDs (ibuprofen) long-term',
      'Annual eGFR and creatinine blood test',
    ],
    treatment: [
      'ACE inhibitors/ARBs to protect kidney function',
      'Dialysis or transplant for advanced CKD',
      'Low-protein diet if advised by nephrologist',
      'Tight glucose and BP management',
    ],
  },
  pancreas: {
    label: 'Pancreas',
    emoji: '🩺',
    color: '#10B981',
    biomarkerKeys: ['Fasting Glucose', 'Postprandial Glucose', 'HbA1c', 'Triglycerides'],
    riskKeys: ['diabetes'],
    symptoms: [
      'Excessive thirst and frequent urination',
      'Unexplained weight loss',
      'Blurry vision or slow-healing wounds',
      'Fatigue and irritability',
      'Upper abdominal pain radiating to the back',
    ],
    prevention: [
      'Maintain fasting glucose 70–99 mg/dL',
      'Keep HbA1c below 5.7% (normal) or < 7% (managed)',
      'Eat a low-glycaemic diet; avoid refined carbs',
      'Exercise daily to improve insulin sensitivity',
      'Avoid high-fat meals to prevent pancreatitis',
    ],
    treatment: [
      'Metformin as first-line for Type 2 Diabetes',
      'Insulin therapy for Type 1 or advanced Type 2',
      'GLP-1 agonists (e.g. semaglutide) for weight + glucose',
      'Enzyme replacement therapy for exocrine insufficiency',
    ],
  },
  blood: {
    label: 'Blood / CBC',
    emoji: '🩸',
    color: '#DC2626',
    biomarkerKeys: ['Hemoglobin', 'RBC', 'WBC', 'Platelets', 'Hematocrit'],
    riskKeys: ['anemia'],
    symptoms: [
      'Persistent fatigue, pallor, or cold hands',
      'Dizziness and shortness of breath',
      'Rapid or irregular heartbeat',
      'Brittle nails and hair loss',
      'Easy bruising or prolonged bleeding',
    ],
    prevention: [
      'Eat iron-rich foods — red meat, spinach, lentils',
      'Pair iron foods with Vitamin C to boost absorption',
      'Avoid tea/coffee directly after iron-rich meals',
      'Regular CBC blood tests every 6–12 months',
      'B12 and folate supplementation if deficient',
    ],
    treatment: [
      'Oral iron supplements (Ferrous Sulphate)',
      'B12 injections for pernicious anaemia',
      'Erythropoietin injections for CKD-related anaemia',
      'Blood transfusion in severe symptomatic anaemia',
    ],
  },
  thyroid: {
    label: 'Thyroid',
    emoji: '🦋',
    color: '#0EA5E9',
    biomarkerKeys: ['Thyroid TSH', 'TSH', 'T3', 'T4'],
    riskKeys: [],
    symptoms: [
      'Unexplained weight gain or loss',
      'Fatigue, sluggishness, or excessive sweating',
      'Cold or heat intolerance',
      'Hair thinning and dry skin',
      'Mood changes, anxiety, or depression',
    ],
    prevention: [
      'Include iodine-rich foods — seafood, dairy, iodised salt',
      'Avoid excessive raw cruciferous vegetables if hypothyroid',
      'Annual TSH screening after age 35',
      'Manage stress — it disrupts thyroid axis',
      'Avoid unnecessary iodine supplements',
    ],
    treatment: [
      'Levothyroxine for hypothyroidism',
      'Methimazole or Propylthiouracil for hyperthyroidism',
      'Radioiodine therapy or surgery in selected cases',
      'Endocrinologist consultation for abnormal TSH',
    ],
  },
};

// ── Helper: get status colour class ─────────────────────────────────────────
function getStatusClass(status) {
  if (status === 'High' || status === 'Low') return 'text-rose-600 dark:text-rose-400';
  if (status === 'Borderline') return 'text-amber-600 dark:text-amber-400';
  return 'text-emerald-600 dark:text-emerald-400';
}

function getStatusBadge(status) {
  if (status === 'High' || status === 'Low')
    return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300';
  if (status === 'Borderline')
    return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300';
  return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300';
}

// ── Organ alert level from biomarkers + risks ────────────────────────────────
function getOrganAlert(organKey, biomarkers, risks) {
  const organ = ORGAN_DATA[organKey];
  if (!organ) return 'normal';

  // Check matched biomarkers
  const matched = (biomarkers || []).filter((b) =>
    organ.biomarkerKeys.some((k) => b.name?.toLowerCase().includes(k.toLowerCase()))
  );
  const hasAbnormal = matched.some((b) => b.status === 'High' || b.status === 'Low');
  const hasBorderline = matched.some((b) => b.status === 'Borderline');

  // Check risk scores
  const highRisk = (risks && organ.riskKeys.some((k) => (risks[k] || 0) >= 60));
  const medRisk  = (risks && organ.riskKeys.some((k) => (risks[k] || 0) >= 35));

  if (hasAbnormal || highRisk) return 'critical';
  if (hasBorderline || medRisk) return 'warning';
  if (matched.length > 0) return 'normal';
  return 'none';
}

// ── Alert ring colours ───────────────────────────────────────────────────────
const ALERT_STYLES = {
  critical: { ring: '#EF4444', glow: 'drop-shadow(0 0 8px rgba(239,68,68,0.7))', pulse: true },
  warning:  { ring: '#F59E0B', glow: 'drop-shadow(0 0 6px rgba(245,158,11,0.6))', pulse: true },
  normal:   { ring: '#10B981', glow: 'drop-shadow(0 0 4px rgba(16,185,129,0.4))', pulse: false },
  none:     { ring: '#94A3B8', glow: 'none', pulse: false },
};

// ── SVG Organ buttons (positioned on body silhouette) ────────────────────────
function OrganButton({ cx, cy, r, organKey, alert, label, emoji, onClick }) {
  const s = ALERT_STYLES[alert];
  return (
    <g
      onClick={() => onClick(organKey)}
      style={{ cursor: 'pointer', filter: s.glow }}
      aria-label={label}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(organKey)}
    >
      {/* Pulse ring for critical/warning */}
      {s.pulse && (
        <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke={s.ring} strokeWidth="1.5" opacity="0.4">
          <animate attributeName="r" values={`${r + 4};${r + 10};${r + 4}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Main circle */}
      <circle cx={cx} cy={cy} r={r} fill={ORGAN_DATA[organKey].color} opacity="0.85" stroke={s.ring} strokeWidth="2.5" />
      {/* Emoji label */}
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="14" style={{ userSelect: 'none' }}>
        {emoji}
      </text>
      {/* Name label */}
      <text x={cx} y={cy + r + 13} textAnchor="middle" fontSize="9" fontWeight="600"
        fill="currentColor" style={{ userSelect: 'none' }} className="fill-slate-600 dark:fill-slate-300">
        {label}
      </text>
    </g>
  );
}

// ── Detail panel (right side) ────────────────────────────────────────────────
function OrganDetail({ organKey, biomarkers, risks, onClose }) {
  const organ = ORGAN_DATA[organKey];
  const [tab, setTab] = useState('values');

  const matchedBiomarkers = (biomarkers || []).filter((b) =>
    organ.biomarkerKeys.some((k) => b.name?.toLowerCase().includes(k.toLowerCase()))
  );

  const riskEntries = organ.riskKeys.map((k) => ({
    key: k,
    label: k === 'heart_disease' ? 'Cardiovascular Risk'
         : k === 'diabetes'     ? 'Diabetes Risk'
         : k === 'anemia'       ? 'Anaemia Risk' : k,
    value: risks?.[k] ?? null,
  })).filter((r) => r.value !== null);

  const tabs = [
    { id: 'values',     label: 'Report Values', icon: <Activity size={12} /> },
    { id: 'symptoms',   label: 'Symptoms',      icon: <AlertCircle size={12} /> },
    { id: 'prevention', label: 'Prevention',    icon: <ShieldCheck size={12} /> },
    { id: 'treatment',  label: 'Treatment',     icon: <Pill size={12} /> },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200/60 dark:border-white/8"
        style={{ borderLeft: `4px solid ${organ.color}` }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{organ.emoji}</span>
          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm">{organ.label}</h4>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Organ Analysis</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition" aria-label="Close">
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-3 border-b border-slate-200/60 dark:border-white/8 overflow-x-auto">
        {tabs.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              tab === tb.id
                ? 'text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-100/80 dark:bg-white/5'
            }`}
            style={tab === tb.id ? { backgroundColor: organ.color } : {}}>
            {tb.icon}{tb.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {tab === 'values' && (
          <>
            {matchedBiomarkers.length === 0 && riskEntries.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-6 text-center text-xs text-slate-500">
                No relevant biomarkers found in the active report for this organ.
              </div>
            ) : (
              <>
                {matchedBiomarkers.map((b) => (
                  <div key={b.name} className="flex items-center justify-between rounded-2xl border border-slate-200/60 dark:border-white/8 bg-white dark:bg-white/3 px-4 py-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{b.name}</p>
                      <p className="text-[10px] text-slate-500">Ref: {b.reference_range} {b.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold tabular-nums ${getStatusClass(b.status)}`}>
                        {b.value} <span className="text-[10px] font-normal text-slate-400">{b.unit}</span>
                      </p>
                      <span className={`inline-block mt-0.5 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${getStatusBadge(b.status)}`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
                {riskEntries.map((r) => (
                  <div key={r.key} className="rounded-2xl border border-slate-200/60 dark:border-white/8 bg-white dark:bg-white/3 px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{r.label}</p>
                      <span className={`text-sm font-bold ${r.value >= 60 ? 'text-rose-600' : r.value >= 35 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {r.value.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(r.value, 100)}%`,
                          backgroundColor: r.value >= 60 ? '#EF4444' : r.value >= 35 ? '#F59E0B' : '#10B981'
                        }} />
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {tab === 'symptoms' && organ.symptoms.map((s, i) => (
          <div key={i} className="flex items-start gap-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 px-4 py-3">
            <AlertCircle size={13} className="mt-0.5 shrink-0 text-rose-500" />
            <p className="text-xs text-slate-700 dark:text-slate-300">{s}</p>
          </div>
        ))}

        {tab === 'prevention' && organ.prevention.map((s, i) => (
          <div key={i} className="flex items-start gap-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 px-4 py-3">
            <ShieldCheck size={13} className="mt-0.5 shrink-0 text-emerald-500" />
            <p className="text-xs text-slate-700 dark:text-slate-300">{s}</p>
          </div>
        ))}

        {tab === 'treatment' && organ.treatment.map((s, i) => (
          <div key={i} className="flex items-start gap-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 px-4 py-3">
            <Pill size={13} className="mt-0.5 shrink-0 text-blue-500" />
            <p className="text-xs text-slate-700 dark:text-slate-300">{s}</p>
          </div>
        ))}
      </div>

      <p className="px-4 pb-3 pt-1 text-[9px] text-slate-400 text-center">
        For educational purposes only. Always consult a qualified doctor.
      </p>
    </div>
  );
}

// ── Main BodyMap component ───────────────────────────────────────────────────
function BodyMap({ biomarkers, risks }) {
  const [selected, setSelected] = useState(null);

  // Organ layout: [organKey, cx, cy, r]
  const organs = [
    ['brain',    150,  62, 22],
    ['thyroid',  150, 115, 16],
    ['heart',    124, 168, 20],
    ['lungs',    176, 168, 20],
    ['liver',    134, 228, 18],
    ['pancreas', 166, 228, 18],
    ['kidney',   150, 285, 20],
    ['blood',    150, 348, 22],
  ];

  return (
    <div className="soft-card p-6">
      {/* Section header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 section-label">
            <span className="text-base">🫀</span>
            Interactive Body Map
          </div>
          <h3 className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
            Organ Health Explorer
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any organ to see related biomarkers, symptoms, prevention and treatment.
          </p>
        </div>
        {/* Legend */}
        <div className="hidden sm:flex flex-col gap-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
          {[['#EF4444','Critical / Abnormal'],['#F59E0B','Borderline / At Risk'],['#10B981','Normal'],['#94A3B8','No Data']].map(([c,l]) => (
            <div key={l} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: c }} />
              {l}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* SVG Body */}
        <div className="flex justify-center lg:w-80 shrink-0">
          <svg
            viewBox="0 60 300 360"
            width="300"
            height="360"
            className="select-none"
            aria-label="Interactive human body map"
            role="img"
          >
            {/* Body silhouette */}
            <g opacity="0.12" fill="currentColor" className="fill-slate-500 dark:fill-slate-300">
              {/* Head */}
              <ellipse cx="150" cy="62" rx="32" ry="36" />
              {/* Neck */}
              <rect x="138" y="95" width="24" height="20" rx="8" />
              {/* Torso */}
              <rect x="98" y="113" width="104" height="170" rx="20" />
              {/* Left arm */}
              <rect x="62" y="118" width="38" height="120" rx="14" />
              {/* Right arm */}
              <rect x="200" y="118" width="38" height="120" rx="14" />
              {/* Left leg */}
              <rect x="100" y="278" width="44" height="140" rx="14" />
              {/* Right leg */}
              <rect x="156" y="278" width="44" height="140" rx="14" />
            </g>

            {/* Organ buttons */}
            {organs.map(([key, cx, cy, r]) => {
              const alert = getOrganAlert(key, biomarkers, risks);
              const organ = ORGAN_DATA[key];
              return (
                <OrganButton
                  key={key}
                  cx={cx} cy={cy} r={r}
                  organKey={key}
                  alert={alert}
                  label={organ.label}
                  emoji={organ.emoji}
                  onClick={setSelected}
                />
              );
            })}
          </svg>
        </div>

        {/* Detail panel */}
        <div className="flex-1 min-h-[420px] rounded-3xl border border-slate-200/60 dark:border-white/8 bg-slate-50/60 dark:bg-white/3 overflow-hidden">
          {selected ? (
            <OrganDetail
              organKey={selected}
              biomarkers={biomarkers}
              risks={risks}
              onClose={() => setSelected(null)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="text-5xl animate-bounce">👆</div>
              <h4 className="font-display text-base font-bold text-slate-700 dark:text-slate-200">
                Select an organ
              </h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Click any organ on the body diagram to explore related biomarker values from your report, symptoms, prevention tips, and treatment options.
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {organs.map(([key]) => {
                  const alert = getOrganAlert(key, biomarkers, risks);
                  const o = ORGAN_DATA[key];
                  return (
                    <button key={key} onClick={() => setSelected(key)}
                      className="flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-blue-300 transition-all hover:-translate-y-0.5">
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: ALERT_STYLES[alert].ring }} />
                      {o.emoji} {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BodyMap;
