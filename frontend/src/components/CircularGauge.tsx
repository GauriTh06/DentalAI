import React from 'react';

interface CircularGaugeProps {
  score: number;
  status: string;
  size?: number;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({ score, status, size = 180 }) => {
  const radius = 70;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine status color scheme
  let colorClass = 'stroke-medical-500';
  let textClass = 'text-medical-400';
  let bgGradient = 'from-medical-500/10 to-teal-500/5';
  
  if (status === 'Excellent') {
    colorClass = 'stroke-emerald-500';
    textClass = 'text-emerald-400';
    bgGradient = 'from-emerald-500/10 to-emerald-400/5';
  } else if (status === 'Good') {
    colorClass = 'stroke-teal-500';
    textClass = 'text-teal-400';
    bgGradient = 'from-teal-500/10 to-blue-500/5';
  } else if (status === 'Moderate') {
    colorClass = 'stroke-amber-500';
    textClass = 'text-amber-400';
    bgGradient = 'from-amber-500/10 to-amber-400/5';
  } else if (status === 'Critical') {
    colorClass = 'stroke-rose-500';
    textClass = 'text-rose-400';
    bgGradient = 'from-rose-500/10 to-rose-400/5';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${bgGradient} blur-xl opacity-60`} />
        
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Background circle track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-slate-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Foreground animated value circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Centered label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold tracking-tight text-white">{score}</span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Score</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <span className={`text-lg font-bold ${textClass}`}>{status}</span>
        <p className="text-xs text-slate-400 mt-1">Dental Health Rating</p>
      </div>
    </div>
  );
};
