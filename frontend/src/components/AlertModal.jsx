import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

function AlertModal({ isOpen, onClose, criticalBiomarkers, mlAnomalies, setActiveTab }) {
  if (!isOpen) return null;

  const handleNavigate = () => {
    onClose();
    setActiveTab('recommendations');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#151c2c] border border-neonCritical/30 rounded-2xl p-6 w-full max-w-md shadow-glow-red transform transition-all">
        
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3 text-neonCritical">
            <AlertTriangle size={28} className="animate-pulse" />
            <h2 className="text-xl font-black uppercase tracking-wider">Critical Alert</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 text-sm text-slate-300 leading-relaxed">
          <p className="mb-4">
            Our AI analysis detected highly abnormal values in your latest medical report that require immediate attention.
          </p>
          
          {criticalBiomarkers && criticalBiomarkers.length > 0 && (
            <div className="mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">Out of Range</span>
              <ul className="space-y-1">
                {criticalBiomarkers.map((bio, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neonCritical" />
                    <span className="font-bold text-white">{bio.name}:</span>
                    <span className="text-neonCritical">{bio.value} {bio.unit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mlAnomalies && mlAnomalies.length > 0 && (
            <div className="mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neonWarning mb-1 block">AI Trend Anomalies</span>
              <ul className="space-y-1">
                {mlAnomalies.map((bio, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neonWarning" />
                    <span className="font-bold text-white">{bio.name}:</span>
                    <span className="text-neonWarning">Unusual fluctuation detected</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all"
          >
            Dismiss
          </button>
          <button 
            onClick={handleNavigate}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-neonCritical/20 hover:bg-neonCritical/30 text-neonCritical border border-neonCritical/30 transition-all"
          >
            View Interventions
          </button>
        </div>

      </div>
    </div>
  );
}

export default AlertModal;
