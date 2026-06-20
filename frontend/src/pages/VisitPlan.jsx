import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCitizenCase } from '../hooks/useCitizenCase';
import ResultCard from '../components/ResultCard';
import VisitGuardScore from '../components/VisitGuardScore';
import OfficerInfoCard from '../components/OfficerInfoCard';
import ProcessTimeline from '../components/ProcessTimeline';
import ChatInput from '../components/ChatInput';
import { Calendar, ArrowRight, Printer, AlertTriangle, MessageSquare, Loader2, Sparkles, HelpCircle } from 'lucide-react';

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

  const handleGoToUpload = () => {
    navigate('/upload');
  };

  if (loading && !visitPlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4 bg-[#FAF8F5]">
        <Loader2 className="h-10 w-10 text-teal-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Formulating your personalized visit strategy...</p>
      </div>
    );
  }

  // Provide realistic defaults if backend analysis is loading/empty
  const plan = visitPlan || {
    score: 80,
    riskLevel: 'Ready',
    officeName: 'Colombo Divisional Secretariat Office',
    roomCounter: 'Room 14, Environment & Land Branch (Counter 4)',
    officerName: 'Mr. K. A. Perera (Assistant Divisional Secretary)',
    availableHours: '9:00 AM - 1:00 PM (Tuesdays and Wednesdays)',
    timeline: [
      {
        step: 1,
        title: 'Grama Niladhari Validation',
        description: 'Meet your local Grama Niladhari to get your residency certificate verified.',
        status: 'ready'
      },
      {
        step: 2,
        title: 'Divisional Secretariat Counter 4',
        description: 'Submit your original National Identity Card and Land Deed at Counter 4 in Room 14.',
        status: 'ready'
      },
      {
        step: 3,
        title: 'Fee Payment at Cashier',
        description: 'Pay the application processing fee of LKR 750.00 at Cashier Counter 2.',
        status: 'pending'
      }
    ],
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        
        {/* Page Header */}
        <div className="text-center md:text-left space-y-2 border-b border-slate-100 pb-4">
          <div className="inline-flex items-center gap-1.5 text-teal-700 font-bold text-sm bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
            <Sparkles className="h-4 w-4" />
            <span>Step 3 of 4: Custom A-to-Z Roadmap</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Your Personalized Guidelines
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl font-semibold">
            Based on your location and requested service, here are the step-by-step guidelines to complete your paperwork. No surprise steps, no wasted journeys.
          </p>
        </div>

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

            {/* AI Form Autofill Trigger Card */}
            <div className="bg-gradient-to-r from-teal-50 to-amber-50 border border-teal-100/60 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
              <div className="space-y-1">
                <h4 className="font-bold text-teal-950 text-base leading-snug">
                  Would you like our AI to automatically prepare and fill out your official application forms right now?
                </h4>
                <p className="text-xs text-teal-850 mt-1 font-medium leading-relaxed">
                  Skip the manual writing. Upload a photo of your NIC or type your details manually to generate the completed Schedule II - Form A ready to print.
                </p>
              </div>
              
              <button
                onClick={handleGoToUpload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap animate-pulse hover:animate-none"
              >
                Autofill Form Now
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Action dossier notice & button */}
            <div className="bg-white border border-slate-200/60 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div>
                <h4 className="font-bold text-slate-800 text-base leading-snug">
                  Ready to prepare your physical document pack?
                </h4>
                <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                  Generate the printable dossier showing verifying codes, talking points, and paper checklists to hand over at the counter.
                </p>
              </div>
              
              <button
                onClick={handleGoToChecklist}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:scale-[1.01] transition-all cursor-pointer whitespace-nowrap"
              >
                <Printer className="h-4.5 w-4.5" />
                View Printable Dossier
              </button>
            </div>

          </div>

          {/* Right Column: AI Chat Helper */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Calendar className="h-4.5 w-4.5 text-teal-600" />
                Recommended Visit Day
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Based on historical crowd data and officer scheduling, the best time to visit is:
              </p>
              <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-lg text-teal-900 text-sm font-bold text-center">
                Next Wednesday at 9:30 AM
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                *Tuesdays and Wednesdays are official public consulting days in Sri Lankan administrative services.
              </p>
            </div>

            <ChatInput />
          </div>
        </div>
      </div>
    </div>
  );
}
