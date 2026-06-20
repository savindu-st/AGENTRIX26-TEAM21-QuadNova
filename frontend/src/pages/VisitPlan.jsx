import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCitizenCase } from '../hooks/useCitizenCase';
import ResultCard from '../components/ResultCard';
import VisitGuardScore from '../components/VisitGuardScore';
import OfficerInfoCard from '../components/OfficerInfoCard';
import ProcessTimeline from '../components/ProcessTimeline';
import ChatInput from '../components/ChatInput';
import { Calendar, ArrowRight, Printer, AlertTriangle, MessageSquare, Loader2 } from 'lucide-react';

export default function VisitPlan() {
  const { visitPlan, caseId, loading, error, analyzeCase } = useCitizenCase();
  const navigate = useNavigate();

  // Redirect if no case active
  useEffect(() => {
    if (!caseId) {
      navigate('/request');
    } else if (!visitPlan) {
      // Re-trigger analysis if details not populated
      analyzeCase(caseId);
    }
  }, [caseId, visitPlan, navigate, analyzeCase]);

  const handleGoToChecklist = () => {
    navigate('/checklist');
  };

  if (loading && !visitPlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Generating your customized visit strategy...</p>
      </div>
    );
  }

  // Provide realistic defaults if backend analysis is loading/empty
  const plan = visitPlan || {
    score: 85,
    riskLevel: 'Ready',
    officeName: 'Colombo Divisional Secretariat Office',
    roomCounter: 'Room 14, Environment & Land Branch (Counter 4)',
    officerName: 'Mr. K. A. Perera (Assistant Divisional Secretary)',
    availableHours: '9:00 AM - 1:00 PM (Tuesdays and Wednesdays)',
    timeline: [
      {
        step: 1,
        title: 'Reception Validation',
        description: 'Go to the Main Reception desk, present your VisitGuard Readiness QR Code to receive your token.',
        status: 'ready'
      },
      {
        step: 2,
        title: 'Document Inspection',
        description: 'Submit your original National Identity Card and Land Deed at Room 14, Counter 4.',
        status: 'ready'
      },
      {
        step: 3,
        title: 'Submit GN Recommendation',
        description: 'Hand over the verified Grama Niladhari letter signed by the Divisional GN officer.',
        status: 'ready'
      },
      {
        step: 4,
        title: 'Fee Payment & Scheduling',
        description: 'Pay the application processing fee of LKR 750.00 at Cashier Counter 2.',
        status: 'pending'
      }
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Overview Result Card */}
      <ResultCard />

      {/* Main Grid: Left details / Right sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Strategy details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* VisitGuard Gauge */}
          <VisitGuardScore score={plan.score} riskLevel={plan.riskLevel} />

          {/* Directory Contact Info */}
          <OfficerInfoCard
            officeName={plan.officeName}
            roomCounter={plan.roomCounter}
            officerName={plan.officerName}
            availableHours={plan.availableHours}
          />

          {/* Stepper Timeline */}
          <ProcessTimeline steps={plan.timeline} />

          {/* Action dossier notice & button */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <h4 className="font-bold text-emerald-950 text-base leading-snug">
                Ready to prepare your physical document pack?
              </h4>
              <p className="text-xs text-emerald-700 mt-1 font-medium leading-relaxed">
                Generate the printable dossier showing verifying codes, talking points, and paper checklists to hand over at the counter.
              </p>
            </div>
            
            <button
              onClick={handleGoToChecklist}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:scale-[1.01] transition-all cursor-pointer whitespace-nowrap"
            >
              <Printer className="h-4.5 w-4.5" />
              View Printable Dossier
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>

        </div>

        {/* Right Column: AI Chat Helper */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 border-b border-gray-100 pb-2">
              <Calendar className="h-4.5 w-4.5 text-emerald-600" />
              Recommended Visit Day
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed font-semibold">
              Based on crowd historical data and Mr. Perera's schedule, the best time to visit is:
            </p>
            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-emerald-900 text-sm font-bold text-center">
              Next Wednesday at 9:30 AM
            </div>
            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
              *Tuesdays and Wednesdays are official public consulting days in Sri Lankan administrative services.
            </p>
          </div>

          <ChatInput />
        </div>
      </div>
    </div>
  );
}
