import React, { useState } from 'react';
import { Apple, Dumbbell, Sun, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

function Recommendations({ report }) {
  const [activeSubTab, setActiveSubTab] = useState('diet');
  const [checkedItems, setCheckedItems] = useState({});

  if (!report) return null;

  const recs = report.recommendations;

  const toggleCheck = (category, index) => {
    const key = `${category}-${index}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Block */}
      <div className="glass-panel p-6 rounded-2xl border border-darkCardBorder">
        <div className="flex items-center space-x-2 text-neonCyan mb-3">
          <Sparkles size={16} />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Tailored Interventions Summary
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
          Based on the diagnostic abnormalities identified in **{report.filename}** (Health Score: {report.health_score}/100), our clinical rules engine has constructed a personalized dietary and physical activity roadmap to help stabilize your biomarkers.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 bg-white/5 p-1 rounded-xl w-fit border border-white/5">
        <button
          onClick={() => setActiveSubTab('diet')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'diet'
              ? 'bg-gradient-to-r from-neonCyan/20 to-neonIndigo/10 text-neonCyan border border-neonCyan/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Apple size={14} />
          <span>Dietary Modifications</span>
        </button>

        <button
          onClick={() => setActiveSubTab('exercise')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'exercise'
              ? 'bg-gradient-to-r from-neonCyan/20 to-neonIndigo/10 text-neonCyan border border-neonCyan/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Dumbbell size={14} />
          <span>Physical Activity Plan</span>
        </button>

        <button
          onClick={() => setActiveSubTab('lifestyle')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'lifestyle'
              ? 'bg-gradient-to-r from-neonCyan/20 to-neonIndigo/10 text-neonCyan border border-neonCyan/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sun size={14} />
          <span>Lifestyle & Sleep Habits</span>
        </button>
      </div>

      {/* Recommendations Cards List */}
      <div className="glass-panel p-6 rounded-2xl border border-darkCardBorder min-h-[300px]">
        {activeSubTab === 'diet' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-2 text-white">
              <Apple className="text-neonCyan" size={18} />
              <h4 className="font-bold text-sm">Nutritional Roadmap</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recs.diet.map((item, idx) => {
                const isChecked = checkedItems[`diet-${idx}`];
                return (
                  <div 
                    key={idx}
                    onClick={() => toggleCheck('diet', idx)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-start space-x-3 ${
                      isChecked 
                        ? 'bg-neonTeal/5 border-neonTeal/20 opacity-60' 
                        : 'bg-white/5 border-white/5 hover:border-slate-600'
                    }`}
                  >
                    <CheckCircle2 
                      size={18} 
                      className={`shrink-0 mt-0.5 transition-colors ${isChecked ? 'text-neonTeal' : 'text-slate-600'}`} 
                    />
                    <p className={`text-xs leading-relaxed ${isChecked ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                      {item}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeSubTab === 'exercise' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-2 text-white">
              <Dumbbell className="text-neonCyan" size={18} />
              <h4 className="font-bold text-sm">Cardio & Strength Training Guidelines</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recs.exercise.map((item, idx) => {
                const isChecked = checkedItems[`exercise-${idx}`];
                return (
                  <div 
                    key={idx}
                    onClick={() => toggleCheck('exercise', idx)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-start space-x-3 ${
                      isChecked 
                        ? 'bg-neonTeal/5 border-neonTeal/20 opacity-60' 
                        : 'bg-white/5 border-white/5 hover:border-slate-600'
                    }`}
                  >
                    <CheckCircle2 
                      size={18} 
                      className={`shrink-0 mt-0.5 transition-colors ${isChecked ? 'text-neonTeal' : 'text-slate-600'}`} 
                    />
                    <p className={`text-xs leading-relaxed ${isChecked ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                      {item}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeSubTab === 'lifestyle' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-2 text-white">
              <Sun className="text-neonCyan" size={18} />
              <h4 className="font-bold text-sm">Daily Habits & Stress Management</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recs.lifestyle.map((item, idx) => {
                const isChecked = checkedItems[`lifestyle-${idx}`];
                return (
                  <div 
                    key={idx}
                    onClick={() => toggleCheck('lifestyle', idx)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-start space-x-3 ${
                      isChecked 
                        ? 'bg-neonTeal/5 border-neonTeal/20 opacity-60' 
                        : 'bg-white/5 border-white/5 hover:border-slate-600'
                    }`}
                  >
                    <CheckCircle2 
                      size={18} 
                      className={`shrink-0 mt-0.5 transition-colors ${isChecked ? 'text-neonTeal' : 'text-slate-600'}`} 
                    />
                    <p className={`text-xs leading-relaxed ${isChecked ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                      {item}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default Recommendations;
