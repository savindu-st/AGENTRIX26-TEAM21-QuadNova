import React from 'react';

const RiskBadge = ({ level }) => {
  const getBadgeStyle = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
      case 'low':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getBadgeStyle(level)}`}>
      {level || 'Unknown'}
    </span>
  );
};

export default RiskBadge;

