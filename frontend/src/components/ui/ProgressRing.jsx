import React from 'react';

function ProgressRing({ value = 0, size = 80, stroke = 7, color = '#10B981', label, sublabel, className = '' }) {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          stroke="rgba(148,163,184,0.2)"
          fill="transparent"
          strokeWidth={stroke}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="progress-ring-circle"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{value}</span>
        {label && <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</span>}
        {sublabel && <span className={`text-xs font-bold ${sublabel}`} />}
      </div>
    </div>
  );
}

export default ProgressRing;
