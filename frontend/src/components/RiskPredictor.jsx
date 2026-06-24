import React from 'react';
import { ShieldAlert, Heart, Activity, Activity as Pulse, Sparkles, CheckCircle } from 'lucide-react';

function RiskPredictor({ risks }) {
  const getRiskClassification = (risk) => {
    if (risk >= 60) return { label: 'CRITICAL RISK', color: 'text-neonCritical', bg: 'bg-neonCritical/10 border-neonCritical/15', bar: 'bg-neonCritical shadow-glow-indigo' };
    if (risk >= 35) return { label: 'ELEVATED RISK', color: 'text-neonWarning', bg: 'bg-neonWarning/10 border-neonWarning/15', bar: 'bg-neonWarning' };
    return { label: 'NORMAL / LOW RISK', color: 'text-neonTeal', bg: 'bg-neonTeal/10 border-neonTeal/15', bar: 'bg-neonTeal' };
  };

  const diabetesClass = getRiskClassification(risks.diabetes);
  const heartClass = getRiskClassification(risks.heart_disease);
  const anemiaClass = getRiskClassification(risks.anemia);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-darkCardBorder">
      
      {/* Section Header */}
      <div className="flex items-center space-x-2 text-neonCyan mb-6">
        <Sparkles size={16} />
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          AI-Powered Disease Risk Assessment
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Diabetes Card */}
        <div className={`p-5 rounded-xl border flex flex-col justify-between ${diabetesClass.bg}`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wide">Diabetes Mellitus</span>
              <Activity size={18} className="text-neonWarning" />
            </div>
            
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
              Probability calculated based on Fasting/PP glucose, HbA1c, Age, BMI, and family history indicators.
            </p>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className={`text-[10px] font-extrabold tracking-wider ${diabetesClass.color}`}>
                {diabetesClass.label}
              </span>
              <span className="text-lg font-black text-white">{risks.diabetes}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${diabetesClass.bar}`}
                style={{ width: `${risks.diabetes}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Heart Disease Card */}
        <div className={`p-5 rounded-xl border flex flex-col justify-between ${heartClass.bg}`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wide">Cardiovascular Disease</span>
              <Heart size={18} className="text-neonCritical" />
            </div>
            
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
              Probability evaluated against cholesterol profile (LDL/HDL), systolic/diastolic blood pressure, smoking status, and physical workouts.
            </p>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className={`text-[10px] font-extrabold tracking-wider ${heartClass.color}`}>
                {heartClass.label}
              </span>
              <span className="text-lg font-black text-white">{risks.heart_disease}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${heartClass.bar}`}
                style={{ width: `${risks.heart_disease}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Anemia Card */}
        <div className={`p-5 rounded-xl border flex flex-col justify-between ${anemiaClass.bg}`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wide">Anemia Deficiency</span>
              <Pulse size={18} className="text-blue-400" />
            </div>
            
            <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
              Probability calculated based on Hemoglobin levels, RBC (Red Blood Cell) count, gender, and biological parameters.
            </p>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className={`text-[10px] font-extrabold tracking-wider ${anemiaClass.color}`}>
                {anemiaClass.label}
              </span>
              <span className="text-lg font-black text-white">{risks.anemia}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${anemiaClass.bar}`}
                style={{ width: `${risks.anemia}%` }}
              ></div>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-4 flex items-start space-x-2 text-[10px] text-slate-500 leading-relaxed">
        <CheckCircle size={12} className="shrink-0 mt-0.5" />
        <p>
          These estimates are statistical risks processed by Random Forest models trained on demographic epidemiological ranges. They do not substitute clinical lab assays or physician advice.
        </p>
      </div>

    </div>
  );
}

export default RiskPredictor;
