import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, colorClass }) => {
  return (
    <div className="relative group rounded-2xl bg-slate-900 border border-slate-800 p-6 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-slate-600 hover:-translate-y-1">
      {/* Background Glow Effect */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-20 ${colorClass}`} />

      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>

          {/* Optional Trend Indicator */}
          {trend && (
            <p className="text-xs font-medium mt-2 flex items-center">
              <span className={trend > 0 ? "text-emerald-400" : "text-rose-400"}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
              <span className="text-slate-500 ml-2">from last month</span>
            </p>
          )}
        </div>

        {/* Icon Container with subtle animation */}
        <div className={`p-3 rounded-xl bg-slate-950/50 border border-slate-800 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Bottom Gradient Line */}
      <div className={`absolute bottom-0 left-0 h-1 w-0 transition-all duration-500 group-hover:w-full ${colorClass}`} />
    </div>
  );
};

export default StatCard;
