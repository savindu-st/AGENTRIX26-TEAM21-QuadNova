import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCitizenCase } from '../hooks/useCitizenCase';
import { ArrowRight, Landmark, FileText, CheckCircle, ShieldAlert, Sparkles } from 'lucide-react';

export default function Home() {
  const { resetCase } = useCitizenCase();
  const navigate = useNavigate();
  const [input, setInput] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    resetCase();
    navigate('/request', { state: { serviceNeed: input } });
  };

  const suggestions = [
    "I need a permit to cut down a dangerous Jak tree in my garden.",
    "I want to request a Grama Niladhari residence certificate.",
    "How do I verify a land ownership deed at the divisional office?"
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 flex flex-col font-sans">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8 relative">
        {/* Warm abstract decoration circles */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-100/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto w-full text-center space-y-10 relative z-10">
          
          {/* Empathetic badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-semibold shadow-sm mx-auto">
            <Sparkles className="h-4 w-4" />
            <span>Sri Lanka Citizen Support Navigator</span>
          </div>

          {/* Core Hook */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              What do you want to <span className="text-teal-600">get done</span> today?
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Describe your government paperwork or visit need in plain English, Sinhala, or Tamil. We'll outline your correct roadmap and prepare your forms instantly.
            </p>
          </div>

          {/* Conversational Search Input */}
          <div className="w-full max-w-3xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-white border-2 border-teal-600/30 hover:border-teal-600/50 focus-within:border-teal-600 rounded-2xl p-2.5 shadow-xl transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your problem (e.g. I need to get a residency certificate)..."
                className="flex-1 px-4 py-3 bg-transparent text-slate-800 placeholder-slate-400/80 text-base sm:text-lg focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
              >
                <span>Next step</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </form>

            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-2.5 justify-center mt-5">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInput(s)}
                  className="text-xs sm:text-sm px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-teal-700 hover:border-teal-300 hover:bg-teal-50/20 transition-all font-semibold shadow-sm cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Friendly reassurance card */}
          <div className="max-w-2xl mx-auto bg-white border border-slate-100 rounded-2xl p-6 shadow-md flex items-start gap-4 text-left">
            <div className="bg-teal-50 text-teal-700 p-3 rounded-xl shrink-0">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-snug">Empathetic Public Service Help</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed font-medium">
                This is not a government agency. We are an independent, community-driven civic helper. We translate complicated rules into straightforward steps and fill out your paperwork automatically so you don't get rejected.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-slate-400 py-8 border-t border-slate-100 no-print">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-500">
            &copy; 2026 PrajaNavigator AI. Designed for public service empowerment.
          </p>
          <p className="text-xs text-slate-400">
            This tool is built to assist citizens. Please verify with local authorities for formal legal mandates.
          </p>
        </div>
      </footer>
    </div>
  );
}
