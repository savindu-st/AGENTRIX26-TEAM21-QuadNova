import React from 'react';
import { MapPin, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { useCitizenCase } from '../hooks/useCitizenCase';

export default function ResultCard() {
  const { citizenData, visitPlan } = useCitizenCase();

  if (!citizenData) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-xl p-6 shadow-md border border-emerald-800/40 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute right-0 bottom-0 translate-y-12 translate-x-12 opacity-5 pointer-events-none">
        <FileText className="h-64 w-64 text-white" />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <span className="bg-emerald-800/60 border border-emerald-700/50 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            AI Classification Result
          </span>
          <span className="text-xs text-emerald-300 font-medium">
            Case: Active Analysis
          </span>
        </div>

        {/* Case Info */}
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Jak Tree Felling Permit Request
          </h2>
          <p className="text-sm text-emerald-200 mt-1 leading-relaxed max-w-2xl font-medium">
            "{citizenData.serviceNeed || 'Requesting license to clear tree from private garden'}"
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-emerald-800/40">
          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
              Citizen Name
            </span>
            <span className="text-sm font-semibold text-emerald-50">
              {citizenData.fullName || 'Anonymous Citizen'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
              District Jurisdiction
            </span>
            <span className="text-sm font-semibold text-emerald-50">
              {citizenData.district || 'Colombo'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
              Service Language
            </span>
            <span className="text-sm font-semibold text-emerald-50">
              {citizenData.language || 'English'}
            </span>
          </div>
        </div>

        {/* Fast facts footer */}
        {visitPlan && (
          <div className="bg-emerald-950/45 border border-emerald-800/30 rounded-lg p-3 flex items-center justify-between mt-2">
            <span className="text-xs text-emerald-200 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Verified {visitPlan.checklist.verified.length} documents. {visitPlan.checklist.missing.length} action items pending.
            </span>
            <ChevronRight className="h-4 w-4 text-emerald-400 shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
}
