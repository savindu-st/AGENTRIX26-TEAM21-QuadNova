import React from 'react';
import { MapPin, User, Clock, Building2, HelpCircle } from 'lucide-react';

export default function OfficerInfoCard({
  officeName = 'Divisional Secretariat Office',
  roomCounter = 'Room 12, Counter 3',
  officerName = 'Mr. Perera',
  availableHours = '9:00 AM - 12:00 PM'
}) {
  return (
    <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-base mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
        <Building2 className="h-5 w-5 text-emerald-600" />
        Target Office & Counter Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Office Location */}
        <div className="flex items-start gap-3">
          <div className="bg-emerald-50 text-emerald-700 p-2 rounded-lg shrink-0 mt-0.5">
            <Building2 className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 block uppercase tracking-wide">
              Government Branch
            </span>
            <span className="text-sm font-semibold text-gray-800">
              {officeName}
            </span>
          </div>
        </div>

        {/* Room / Counter */}
        <div className="flex items-start gap-3">
          <div className="bg-emerald-50 text-emerald-700 p-2 rounded-lg shrink-0 mt-0.5">
            <MapPin className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 block uppercase tracking-wide">
              Desk Location / Room
            </span>
            <span className="text-sm font-semibold text-gray-800">
              {roomCounter}
            </span>
          </div>
        </div>

        {/* Officer Name */}
        <div className="flex items-start gap-3">
          <div className="bg-emerald-50 text-emerald-700 p-2 rounded-lg shrink-0 mt-0.5">
            <User className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 block uppercase tracking-wide">
              Assigned Officer
            </span>
            <span className="text-sm font-semibold text-gray-800">
              {officerName}
            </span>
          </div>
        </div>

        {/* Available Hours */}
        <div className="flex items-start gap-3">
          <div className="bg-emerald-50 text-emerald-700 p-2 rounded-lg shrink-0 mt-0.5">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 block uppercase tracking-wide">
              Official Public Hours
            </span>
            <span className="text-sm font-semibold text-gray-800">
              {availableHours}
            </span>
          </div>
        </div>
      </div>

      {/* Helpful context note */}
      <div className="mt-4 bg-emerald-50/40 border border-emerald-100 rounded-lg p-3 flex items-start gap-2">
        <HelpCircle className="h-4.5 w-4.5 text-emerald-700 shrink-0 mt-0.5" />
        <p className="text-xs text-emerald-900 leading-relaxed font-medium">
          Officers are sometimes scheduled for fieldwork. We highly recommend arriving within the listed hours and presenting your VisitGuard token at reception as early as possible.
        </p>
      </div>
    </div>
  );
}
