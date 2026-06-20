import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';

export default function LanguageToggle() {
  const [lang, setLang] = useState('English');
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { label: 'English', native: 'English' },
    { label: 'Sinhala', native: 'සිංහල' }
  ];

  const handleSelect = (name) => {
    setLang(name);
    setIsOpen(false);
    // In a full implementation, we could tie this to an i18n hook
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-xl text-sm bg-white hover:bg-slate-50 text-slate-700 focus:outline-none transition-colors duration-150 shadow-sm cursor-pointer"
      >
        <Globe className="h-4 w-4 text-teal-600" />
        <span className="font-semibold">{lang}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-36 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 focus:outline-none overflow-hidden">
            <div className="py-1">
              {languages.map((l) => (
                <button
                  key={l.label}
                  onClick={() => handleSelect(l.label)}
                  className="flex items-center justify-between w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-950 transition-colors cursor-pointer"
                >
                  <span className="font-semibold">{l.native}</span>
                  {lang === l.label && (
                    <Check className="h-4 w-4 text-teal-600 font-bold" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
