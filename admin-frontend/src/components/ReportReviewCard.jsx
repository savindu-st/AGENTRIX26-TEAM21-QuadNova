import React, { useState } from 'react';
import { User, MapPin, Clock, Check, X, AlertCircle } from 'lucide-react';

const ReportReviewCard = ({ report, onUpdateStatus }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (status) => {
    setIsUpdating(true);
    await onUpdateStatus(report.id, status);
    setIsUpdating(false);
  };

  // Determine colors based on reported crowd level
  const crowdColors = {
    'Low': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    'Medium': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'High': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  const statusColors = {
    'Verified': 'text-emerald-400',
    'Rejected': 'text-rose-400',
    'Pending': 'text-slate-400',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden">

      {/* Background Crowd Level Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-5 pointer-events-none ${crowdColors[report.crowdLevel]?.split(' ')[0]}`} />

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <User className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">{report.reporterName}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" /> {report.timestamp}
            </p>
          </div>
        </div>

        {/* Current Status Badge */}
        <span className={`text-xs font-bold uppercase tracking-wider ${statusColors[report.status]}`}>
          {report.status}
        </span>
      </div>

      <div className="space-y-4 mb-6 relative z-10">
        <div className="flex items-center gap-2 text-slate-300">
          <MapPin className="w-4 h-4 text-slate-500" />
          <span className="font-medium text-sm">{report.officeName}</span>
        </div>

        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Reported Crowd Level</p>
          <span className={`px-3 py-1 text-sm font-bold rounded-full border inline-block ${crowdColors[report.crowdLevel]}`}>
            {report.crowdLevel} Traffic
          </span>
          {report.notes && (
            <p className="text-sm text-slate-400 mt-3 italic">"{report.notes}"</p>
          )}
        </div>
      </div>

      {/* Moderation Actions */}
      <div className="flex gap-2 pt-4 border-t border-slate-800">
        <button
          onClick={() => handleUpdate('Verified')}
          disabled={isUpdating || report.status === 'Verified'}
          className="flex-1 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 disabled:opacity-30 disabled:hover:bg-emerald-500/10 disabled:hover:text-emerald-400"
        >
          <Check className="w-4 h-4" /> Verify
        </button>

        <button
          onClick={() => handleUpdate('Pending')}
          disabled={isUpdating || report.status === 'Pending'}
          className="px-3 py-2 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center disabled:opacity-30"
          title="Mark as Pending"
        >
          <AlertCircle className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleUpdate('Rejected')}
          disabled={isUpdating || report.status === 'Rejected'}
          className="flex-1 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 disabled:opacity-30 disabled:hover:bg-rose-500/10 disabled:hover:text-rose-400"
        >
          <X className="w-4 h-4" /> Reject
        </button>
      </div>

    </div>
  );
};

export default ReportReviewCard;
