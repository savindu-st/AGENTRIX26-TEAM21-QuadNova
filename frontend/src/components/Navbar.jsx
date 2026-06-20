import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Landmark, Compass, HelpCircle, MessageSquare } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import { useCitizenCase } from '../hooks/useCitizenCase';

export default function Navbar() {
  const location = useLocation();
  const { caseId, resetCase } = useCitizenCase();

  return (
    <nav className="no-print sticky top-0 z-50 backdrop-blur-md bg-emerald-950/90 border-b border-emerald-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
            onClick={() => {
              if (location.pathname === '/') resetCase();
            }}
          >
            <div className="bg-emerald-700 p-2 rounded-lg text-emerald-100 group-hover:bg-emerald-600 transition-colors shadow-inner">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight block text-emerald-50">
                PrajaNavigator <span className="text-emerald-400">AI</span>
              </span>
              <span className="text-xs text-emerald-300 block -mt-1 font-medium">
                Visit-Readiness Assistant
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'text-emerald-400 bg-emerald-900/40' 
                  : 'text-emerald-100 hover:text-white hover:bg-emerald-900/20'
              }`}
            >
              <Compass className="h-4 w-4" />
              Home
            </Link>
            
            {caseId && (
              <button
                onClick={resetCase}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-emerald-100 hover:text-white hover:bg-emerald-900/20 transition-colors"
              >
                Reset Case
              </button>
            )}

            <Link
              to="/community-update"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/community-update' 
                  ? 'text-emerald-400 bg-emerald-900/40' 
                  : 'text-emerald-100 hover:text-white hover:bg-emerald-900/20'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Community Report
            </Link>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-4">
            <LanguageToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
