import React, { useState } from 'react';
import { CheckSquare, Square, AlertCircle, Sparkles, MessageCircle } from 'lucide-react';

export default function ChecklistCard({ title, items = [], type = 'verified' }) {
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (idx) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const getStyle = () => {
    switch (type) {
      case 'missing':
        return {
          headerBg: 'bg-red-50 text-red-950 border-red-200',
          titleColor: 'text-red-900',
          borderColor: 'border-red-150',
          icon: <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />,
          itemBg: 'hover:bg-red-50/30'
        };
      case 'talkingPoints':
        return {
          headerBg: 'bg-indigo-50 text-indigo-950 border-indigo-200',
          titleColor: 'text-indigo-900',
          borderColor: 'border-indigo-150',
          icon: <MessageCircle className="h-5 w-5 text-indigo-600 shrink-0" />,
          itemBg: 'hover:bg-indigo-50/30'
        };
      case 'verified':
      default:
        return {
          headerBg: 'bg-emerald-50 text-emerald-950 border-emerald-200',
          titleColor: 'text-emerald-900',
          borderColor: 'border-emerald-150',
          icon: <Sparkles className="h-5 w-5 text-emerald-600 shrink-0" />,
          itemBg: 'hover:bg-emerald-50/30'
        };
    }
  };

  const style = getStyle();

  if (items.length === 0) return null;

  return (
    <div className={`border rounded-xl bg-white shadow-sm overflow-hidden ${style.borderColor} print:border-black`}>
      {/* Card Header */}
      <div className={`px-4 py-3 border-b font-semibold flex items-center gap-2 text-sm md:text-base ${style.headerBg} print:bg-transparent print:text-black print:border-black`}>
        {style.icon}
        <h3 className={style.titleColor}>{title}</h3>
      </div>

      {/* Card Body / Checklist List */}
      <ul className="divide-y divide-gray-100 print:divide-black">
        {items.map((item, idx) => {
          const isChecked = !!checkedItems[idx];
          return (
            <li
              key={idx}
              onClick={() => toggleCheck(idx)}
              className={`flex items-start gap-3 px-4 py-3.5 text-sm cursor-pointer select-none transition-colors duration-150 ${style.itemBg} print:hover:bg-transparent`}
            >
              {type !== 'talkingPoints' ? (
                <div className="shrink-0 mt-0.5 text-gray-400 hover:text-emerald-600 transition-colors">
                  {isChecked ? (
                    <CheckSquare className="h-4.5 w-4.5 text-emerald-600 print:text-black" />
                  ) : (
                    <Square className="h-4.5 w-4.5" />
                  )}
                </div>
              ) : (
                <span className="inline-flex items-center justify-center bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 shrink-0 print:border print:border-black print:bg-transparent print:text-black">
                  Tip {idx + 1}
                </span>
              )}

              <span
                className={`text-gray-800 leading-relaxed font-medium print:text-black ${
                  isChecked && type !== 'talkingPoints'
                    ? 'line-through text-gray-400 print:no-underline'
                    : ''
                }`}
              >
                {item}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
