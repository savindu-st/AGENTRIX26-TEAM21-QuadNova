import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Landmark, Compass, HelpCircle, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';
import { useCitizenCase } from '../hooks/useCitizenCase';

export default function Navbar() {
  const location = useLocation();
  const { caseId, resetCase } = useCitizenCase();
  const { t } = useTranslation();

  return (
    <nav className="no-print sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-150 text-slate-800 shadow-sm">
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
            <div className="bg-teal-50 p-2 rounded-xl text-teal-600 group-hover:bg-teal-100 transition-colors shadow-sm">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight block text-slate-800">
                PrajaNavigator <span className="text-teal-600">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-bold uppercase tracking-wider">
                {t('nav.brand_sub')}
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                location.pathname === '/' 
                  ? 'text-teal-700 bg-teal-50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="h-4 w-4" />
              {t('nav.home')}
            </Link>
            
            {caseId && (
              <button
                onClick={resetCase}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                {t('nav.reset_case')}
              </button>
            )}

            <Link
              to="/community-update"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                location.pathname === '/community-update' 
                  ? 'text-teal-700 bg-teal-50' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              {t('nav.community_updates')}
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
