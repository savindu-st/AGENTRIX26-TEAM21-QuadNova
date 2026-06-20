import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  HelpCircle, 
  MapPin, 
  Sparkles, 
  Users, 
  FileText, 
  ArrowRight,
  Landmark,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useCitizenCase } from '../hooks/useCitizenCase';

export default function Home() {
  const { resetCase } = useCitizenCase();

  const features = [
    {
      title: 'Service Identification',
      desc: 'Pinpoints exactly what document or permit you need based on natural language queries.',
      icon: <Sparkles className="h-6 w-6 text-emerald-600" />
    },
    {
      title: 'Pre-visit Validation',
      desc: 'AI-OCR scan verifies and pre-checks documents to ensure they are complete before you travel.',
      icon: <FileText className="h-6 w-6 text-emerald-600" />
    },
    {
      title: 'VisitGuard Score',
      desc: 'Calculates visit-readiness risk levels. Know if you are at high, moderate, or low risk of rejection.',
      icon: <ShieldCheck className="h-6 w-6 text-emerald-600" />
    },
    {
      title: 'Officer & Counter Guidance',
      desc: 'Tells you exactly which room, counter, and officer handles your query to avoid long queue jumps.',
      icon: <MapPin className="h-6 w-6 text-emerald-600" />
    },
    {
      title: 'Community Updates',
      desc: 'Real-time, crowdsourced waiting times and procedural changes reported by fellow citizens.',
      icon: <Users className="h-6 w-6 text-emerald-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 text-white overflow-hidden py-16 md:py-24 border-b border-emerald-800/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_45%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/40 border border-emerald-700/50 text-emerald-300 text-xs font-semibold max-w-max mx-auto lg:mx-0">
                <Landmark className="h-3.5 w-3.5" />
                Sri Lanka Civic Tech Platform
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                PrajaNavigator <span className="text-emerald-400">AI</span>
              </h1>
              <p className="text-lg md:text-xl text-emerald-100/90 leading-relaxed font-medium max-w-2xl">
                The smart government service visit-readiness assistant. Stop visiting offices multiple times for the same task. Check your readiness, validate paperwork, and get your custom visit checklist instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Link
                  to="/request"
                  onClick={resetCase}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-base font-bold rounded-xl shadow-lg hover:shadow-emerald-500/10 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  Start Request
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/community-update"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-transparent hover:bg-emerald-900/35 border border-emerald-600 rounded-xl text-base font-semibold text-emerald-100 hover:text-white transition-all cursor-pointer"
                >
                  Report Office Friction
                </Link>
              </div>
            </div>

            {/* Hero Right - Graphic Display */}
            <div className="lg:col-span-5 hidden lg:block relative">
              <div className="bg-emerald-900/25 border border-emerald-800/40 backdrop-blur-sm rounded-2xl p-6 shadow-2xl relative">
                <div className="absolute -top-3 -left-3 bg-emerald-500 text-emerald-950 text-xs font-black px-2.5 py-1 rounded-md shadow uppercase tracking-wide">
                  VisitGuard Active
                </div>
                <div className="space-y-4">
                  {/* Mock card status */}
                  <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
                    <span className="text-xs font-semibold text-emerald-300">Target Desk: Room 12, Counter 3</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">NIC Verified</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Tiny gauge */}
                    <div className="h-16 w-16 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-lg text-emerald-400 bg-emerald-950">
                      92%
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-50 text-sm">Case Status: Ready for Visit</h4>
                      <p className="text-xs text-emerald-300/80 leading-snug mt-0.5">All essential certificates scanned. Counter talking points generated.</p>
                    </div>
                  </div>
                  <div className="bg-emerald-950/40 border border-emerald-800/30 rounded-lg p-3 text-xs text-emerald-200">
                    "I want to get a permit to cut down a jak tree in my private residential garden..."
                  </div>
                </div>
              </div>
              {/* Decorative glows */}
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Solver Section */}
      <section className="py-16 bg-white border-b border-gray-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Eliminate Office Friction, Queues, and Rejections
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed font-medium">
              Citizens in Sri Lanka spend an average of 3 visits to complete simple requests at Divisional Secretariats due to minor clerical errors, forgotten forms, or unavailable officers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-gray-50 border border-gray-150 rounded-xl p-6 space-y-3">
              <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg text-red-700 max-w-max">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Confusing Paperwork</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                Not knowing which affidavit, deed copy, or identity paper is needed leads to sudden rejections at the service counter.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-150 rounded-xl p-6 space-y-3">
              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-amber-700 max-w-max">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Wasted Trips & Queues</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                Waiting in line for hours only to be told that the required officer is out in the field or a specific counter has changed.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-150 rounded-xl p-6 space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-emerald-700 max-w-max">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">PrajaNavigator Solution</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                Get AI-driven confirmation of what you need, pre-validate files online, and walk in with an exact printable counter checklist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 bg-gray-50 border-b border-gray-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">How it Works</h2>
            <p className="text-sm text-gray-600 font-medium">Three simple steps to visit-readiness</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                1
              </div>
              <h3 className="font-bold text-gray-900 text-base">Input Your Need</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs font-medium">
                Briefly describe what you need to get done, and tell us what documents you currently hold.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                2
              </div>
              <h3 className="font-bold text-gray-900 text-base">Upload & Check</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs font-medium">
                Upload scans or photos of your identity papers. Our AI pre-validates them for clarity and seals.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                3
              </div>
              <h3 className="font-bold text-gray-900 text-base">Get Custom Visit Plan</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs font-medium">
                Obtain your VisitGuard Readiness Score, official counter directory, and a printable dossier pack.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Core Features</h2>
            <p className="text-sm text-gray-600 font-medium">Powered by AI to make bureaucracy accessible</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="p-6 border border-gray-150 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200 space-y-4"
              >
                <div className="bg-emerald-50 p-3 rounded-xl max-w-max text-emerald-700">
                  {feat.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{feat.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/request"
              onClick={resetCase}
              className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-600 font-bold text-base transition-colors"
            >
              Start analyzing your document status now
              <ChevronRight className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-gray-900 text-gray-400 py-8 border-t border-gray-800 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-sm font-semibold">
            &copy; 2026 PrajaNavigator AI. Designed for public service empowerment.
          </p>
          <p className="text-xs text-gray-500">
            This platform uses AI to analyze documentation. Always double-check official gazette mandates before taking critical legal decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
