import React from 'react';
import { Highlight } from '../types';

interface SmartTextProps {
  text: string;
  highlights: Highlight[];
}

const SmartText: React.FC<SmartTextProps> = ({ text, highlights }) => {
  if (!highlights || highlights.length === 0) {
    return <span>{text}</span>;
  }

  // Helper to escape regex special characters
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // We need to split the text by the highlighted substrings.
  // This is a simplified approach that splits by the first occurrence found.
  // A robust production app would handle overlapping or multiple identical substrings by index.

  // Create a regex pattern that matches any of the substrings
  const pattern = new RegExp(
    `(${highlights.map(h => escapeRegExp(h.substring)).join('|')})`,
    'g'
  );

  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, index) => {
        const highlight = highlights.find(h => h.substring === part);

        if (highlight) {
          return (
            <span key={index} className="relative group inline-block">
              {/* Highlighted Text */}
              <span className="underline decoration-orange-400 decoration-2 underline-offset-4 cursor-help text-slate-900 font-medium bg-orange-50/50 rounded px-0.5">
                {part}
              </span>

              <div className="absolute bottom-full left-0 mb-3 hidden group-hover:block w-64 z-[100]">
                <div className="bg-slate-900 text-white text-sm rounded-lg p-4 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-2 border-8 border-transparent border-t-slate-900"></div>

                  <div className="font-semibold text-orange-300 mb-1 text-xs uppercase tracking-wide">
                    Issue: {highlight.reason}
                  </div>
                  <div className="text-slate-200">
                    <span className="text-slate-400 mr-2">Try:</span>
                    "{highlight.better_alternative}"
                  </div>
                </div>
              </div>
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export default SmartText;