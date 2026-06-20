import React from 'react';
import { CheckCircle2, AlertCircle, Circle, Play } from 'lucide-react';

export default function ProcessTimeline({ steps = [] }) {
  if (steps.length === 0) return null;

  return (
    <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 text-base mb-5 flex items-center gap-2">
        <Play className="h-4.5 w-4.5 text-emerald-600 fill-emerald-600" />
        Office Visit Step-by-Step Roadmap
      </h3>

      <div className="relative border-l-2 border-emerald-100 ml-4 pl-6 space-y-6">
        {steps.map((item, index) => {
          // Status Styling
          let nodeIcon = <Circle className="h-5 w-5 text-gray-300 fill-white" />;
          let bgClass = 'bg-gray-50';
          let borderClass = 'border-gray-200';

          if (item.status === 'ready') {
            nodeIcon = <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-50" />;
            bgClass = 'bg-emerald-50/20';
            borderClass = 'border-emerald-100';
          } else if (item.status === 'warning') {
            nodeIcon = <AlertCircle className="h-5 w-5 text-amber-600 fill-amber-50" />;
            bgClass = 'bg-amber-50/20';
            borderClass = 'border-amber-100';
          }

          return (
            <div key={index} className="relative group">
              {/* Timeline Bullet Node */}
              <div className="absolute -left-[35px] top-1 bg-white p-0.5 rounded-full z-10 transition-transform duration-200 group-hover:scale-115">
                {nodeIcon}
              </div>

              {/* Step Content */}
              <div className={`p-4 rounded-xl border ${bgClass} ${borderClass} transition-shadow duration-200 hover:shadow-sm`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider">
                    Step {item.step || index + 1}
                  </span>
                  {item.status === 'ready' && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                      Verified
                    </span>
                  )}
                  {item.status === 'warning' && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                      Action Required
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 text-sm md:text-base leading-snug">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
