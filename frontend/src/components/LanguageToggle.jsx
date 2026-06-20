import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';

export default function LanguageToggle() {
  const [lang, setLang] = useState('English');
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { label: 'English', native: 'English' },
    { label: 'Sinhala', native: 'සිංහල' },
    { label: 'Tamil', native: 'தமிழ்' }
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
        className="inline-flex items-center gap-2 px-3 py-1.5 border border-emerald-700 rounded-lg text-sm bg-emerald-900/50 hover:bg-emerald-900 text-emerald-100 focus:outline-none transition-colors duration-150"
      >
        <Globe className="h-4 w-4 text-emerald-400" />
        <span>{lang}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 focus:outline-none overflow-hidden">
            <div className="py-1">
              {languages.map((l) => (
                <button
                  key={l.label}
                  onClick={() => handleSelect(l.label)}
                  className="flex items-center justify-between w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-950 transition-colors"
                >
                  <span className="font-medium">{l.native}</span>
                  {lang === l.label && (
                    <Check className="h-4 w-4 text-emerald-600" />
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
