import React from 'react';
import { MapPin, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { useCitizenCase } from '../hooks/useCitizenCase';

export default function ResultCard() {
  const { citizenData, visitPlan } = useCitizenCase();

  if (!citizenData) return null;

  return (
    <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-700 text-white rounded-2xl p-6 shadow-md border border-teal-500/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute right-0 bottom-0 translate-y-12 translate-x-12 opacity-[0.08] pointer-events-none">
        <FileText className="h-64 w-64 text-white" />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <span className="bg-white/15 border border-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            AI Classification Result
          </span>
          <span className="text-xs text-teal-100 font-bold">
            Case Status: Active
          </span>
        </div>

        {/* Case Info */}
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight leading-tight">
            Government Document Guide Request
          </h2>
          <p className="text-sm text-teal-50/90 leading-relaxed max-w-2xl font-medium">
            "{citizenData.serviceNeed || 'Requesting documentation analysis'}"
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/25">
          <div>
            <span className="text-[10px] text-teal-200 font-bold uppercase tracking-wider block">
              Citizen Name
            </span>
            <span className="text-sm font-bold text-white">
              {citizenData.fullName || 'Anonymous Citizen'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-teal-200 font-bold uppercase tracking-wider block">
              Residential District
            </span>
            <span className="text-sm font-bold text-white">
              {citizenData.district || 'Colombo'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-teal-200 font-bold uppercase tracking-wider block">
              Service Language
            </span>
            <span className="text-sm font-bold text-white">
              {citizenData.language || 'English'}
            </span>
          </div>
        </div>

        {/* Fast facts footer */}
        {visitPlan && (
          <div className="bg-white/10 border border-white/10 rounded-xl p-3.5 flex items-center justify-between mt-2 shadow-inner">
            <span className="text-xs text-teal-50 flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="h-4 w-4 text-teal-200 shrink-0" />
              Guidelines generated. Stack physical documents as outlined below.
            </span>
            <ChevronRight className="h-4 w-4 text-teal-200 shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
}
