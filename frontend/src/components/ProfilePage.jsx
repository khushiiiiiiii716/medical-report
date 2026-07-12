import React from 'react';
import { User, Heart, Activity, Save, CheckCircle2 } from 'lucide-react';

function ProfilePage({ userProfile, onUpdate, t }) {
  const [saved, setSaved] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const get = (k) => fd.get(k);
    const h = parseFloat(get('height'));
    const w = parseFloat(get('weight'));
    onUpdate({
      name: get('name'),
      age: parseInt(get('age')),
      gender: get('gender'),
      height: h,
      weight: w,
      bmi: parseFloat((w / ((h / 100) ** 2)).toFixed(1)),
      smoking: get('smoking') === 'true',
      exercise: get('exercise') === 'true',
      family_history_diabetes: get('fhd') === 'true',
      family_history_heart: get('fhh') === 'true',
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const bmiCategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600 bg-blue-50' };
    if (bmi < 25) return { label: 'Normal', color: 'text-emerald-600 bg-emerald-50' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-600 bg-amber-50' };
    return { label: 'Obese', color: 'text-rose-600 bg-rose-50' };
  };

  const bmiInfo = bmiCategory(userProfile.bmi);

  return (
    <div className="mx-auto max-w-3xl animate-fade-in-up">
      <div className="soft-card overflow-hidden">
        {/* Profile header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-500 px-8 py-10 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggIGQ9Ik0zNiAzNGg2djZoLTZ6TTAgMzRoNnY2SDB6TTAgMGg2djZIMHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
          <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-white/30 bg-white/20 text-3xl font-bold backdrop-blur">
              {userProfile.name?.charAt(0) || 'U'}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-display text-2xl font-bold">{userProfile.name}</h3>
              <p className="text-sm text-white/80">{userProfile.gender}, {userProfile.age} years</p>
            </div>
            <div className={`ml-auto rounded-2xl px-4 py-2 text-center ${bmiInfo.color}`}>
              <div className="text-[10px] font-bold uppercase tracking-wider">BMI</div>
              <div className="font-display text-xl font-bold">{userProfile.bmi}</div>
              <div className="text-[10px] font-semibold">{bmiInfo.label}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-8">
          <div>
            <h4 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-slate-900 dark:text-white">
              <User size={18} className="text-blue-500" />
              {t('profile_title') || 'Personal Health Parameters'}
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { n: 'name', type: 'text', label: t('label_name') || 'Name', def: userProfile.name },
                { n: 'age', type: 'number', label: t('label_age') || 'Age', def: userProfile.age },
              ].map((field) => (
                <div key={field.n}>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">{field.label}</label>
                  <input name={field.n} type={field.type} defaultValue={field.def} required className="input-field" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('label_gender') || 'Gender'}</label>
              <select name="gender" defaultValue={userProfile.gender} className="input-field">
                <option value="Male">{t('opt_male') || 'Male'}</option>
                <option value="Female">{t('opt_female') || 'Female'}</option>
                <option value="Other">{t('opt_other') || 'Other'}</option>
              </select>
            </div>
            {[
              { n: 'height', label: t('label_height') || 'Height (cm)', def: userProfile.height },
              { n: 'weight', label: t('label_weight') || 'Weight (kg)', def: userProfile.weight },
            ].map((field) => (
              <div key={field.n}>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">{field.label}</label>
                <input name={field.n} type="number" step="0.1" defaultValue={field.def} required className="input-field" />
              </div>
            ))}
          </div>

          <div>
            <h4 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-slate-900 dark:text-white">
              <Heart size={18} className="text-rose-500" />
              Lifestyle & Family History
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { n: 'smoking', label: t('label_smoking') || 'Do you smoke?', def: userProfile.smoking, opts: [{ v: 'true', l: t('opt_yes') || 'Yes' }, { v: 'false', l: t('opt_no') || 'No' }] },
                { n: 'exercise', label: t('label_exercise') || 'Regular Exercise?', def: userProfile.exercise, opts: [{ v: 'true', l: t('opt_yes') || 'Yes' }, { v: 'false', l: t('opt_sedentary') || 'No' }] },
                { n: 'fhd', label: t('label_fam_diabetes') || 'Diabetes Family History?', def: userProfile.family_history_diabetes, opts: [{ v: 'false', l: t('opt_no') || 'No' }, { v: 'true', l: t('opt_yes') || 'Yes' }] },
                { n: 'fhh', label: t('label_fam_heart') || 'Heart Disease Family History?', def: userProfile.family_history_heart, opts: [{ v: 'false', l: t('opt_no') || 'No' }, { v: 'true', l: t('opt_yes') || 'Yes' }] },
              ].map((field) => (
                <div key={field.n}>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">{field.label}</label>
                  <select name={field.n} defaultValue={String(field.def)} className="input-field">
                    {field.opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full">
            {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {saved ? 'Saved Successfully!' : (t('btn_save_profile') || 'Save Health Parameters')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
