import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

export default function VisitGuardScore({ score = 0, riskLevel = 'Ready' }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Smooth initial count animation
    const timeout = setTimeout(() => {
      let current = 0;
      const step = Math.ceil(score / 30);
      const interval = setInterval(() => {
        current += step;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(interval);
        } else {
          setAnimatedScore(current);
        }
      }, 20);
      return () => clearInterval(interval);
    }, 100);
    return () => clearTimeout(timeout);
  }, [score]);

  // Determine colors based on risk level
  const getTheme = () => {
    const norm = riskLevel.toLowerCase();
    if (norm === 'high risk' || score < 50) {
      return {
        color: 'text-red-600',
        stroke: '#ef4444',
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: <XCircle className="h-5 w-5 text-red-600 shrink-0" />,
        badgeBg: 'bg-red-100 text-red-800 border-red-200',
        desc: 'Significant document gaps detected. Visiting the office now is highly likely to result in rejection.'
      };
    } else if (norm === 'moderate' || score < 80) {
      return {
        color: 'text-amber-600',
        stroke: '#f59e0b',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
        desc: 'Almost ready. Some secondary documents or cash payments are missing. Proceed with caution.'
      };
    } else {
      return {
        color: 'text-teal-600',
        stroke: '#0d9488',
        bg: 'bg-teal-50/50',
        border: 'border-teal-100',
        icon: <ShieldCheck className="h-5 w-5 text-teal-600 shrink-0" />,
        badgeBg: 'bg-teal-100/80 text-teal-800 border-teal-200',
        desc: 'Excellent! All core requirements and documents verified. You are ready to visit the counter.'
      };
    }
  };

  const theme = getTheme();
  
  // Circumference for strokeDashoffset calculation (r = 40 => 2 * pi * r = 251.32)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className={`border rounded-xl p-6 ${theme.bg} ${theme.border} flex flex-col md:flex-row items-center gap-6 shadow-sm`}>
      {/* Gauge Visual */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg className="w-32 h-32 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#e2e8f0"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={theme.stroke}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Score text inside */}
        <div className="absolute text-center">
          <span className="text-3xl font-extrabold text-gray-900 block leading-none">
            {animatedScore}%
          </span>
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
            Ready
          </span>
        </div>
      </div>

      {/* Description & Badge */}
      <div className="flex-1 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2 justify-center md:justify-start">
          <span className="font-semibold text-gray-900 text-lg">
            VisitGuard Readiness Score
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border max-w-max mx-auto md:mx-0 ${theme.badgeBg}`}>
            {theme.icon}
            {riskLevel}
          </span>
        </div>
        
        <p className="text-sm text-gray-700 leading-relaxed font-medium">
          {theme.desc}
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-gray-500 justify-center md:justify-start">
          <RefreshCw className="h-3.5 w-3.5" />
          Last calculated: Just now by PrajaNavigator AI
        </div>
      </div>
    </div>
  );
}
