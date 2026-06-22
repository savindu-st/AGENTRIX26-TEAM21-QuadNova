import React from 'react';
import { HelpCircle, CheckCircle } from 'lucide-react';

export default function FollowUpCard({ question, value, onChange }) {
  return (
    <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-3.5">
        <div className="bg-emerald-50 text-emerald-700 p-2 rounded-lg shrink-0">
          <HelpCircle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-base leading-snug mb-3">
            {question.text}
          </h4>

          {/* Render inputs based on type */}
          {question.type === 'select' && (
            <div className="relative max-w-md">
              <select
                value={value || ''}
                onChange={(e) => onChange(question.id, e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition-colors"
              >
                <option value="" disabled>Select an option...</option>
                {question.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}

          {question.type === 'radio' && (
            <div className="flex flex-wrap gap-3">
              {question.options.map((opt) => {
                const isSelected = value === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onChange(question.id, opt)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium border transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {isSelected && <CheckCircle className="h-4 w-4" />}
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {question.type === 'text' && (
            <div className="max-w-md">
              <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(question.id, e.target.value)}
                placeholder="Enter details..."
                className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
