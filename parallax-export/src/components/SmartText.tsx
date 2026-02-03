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
  // Safety check: filter out invalid items first
  const validHighlights = highlights.filter(h => h && h.text);

  if (validHighlights.length === 0) return <span>{text}</span>;

  const pattern = new RegExp(
    `(${validHighlights.map(h => escapeRegExp(h.text)).join('|')})`,
    'g'
  );

  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, index) => {
        const highlight = validHighlights.find(h => h.text === part);

        if (highlight) {
          return (
            <span key={index} className="relative group inline-block">
              {/* Highlighted Text */}
              <span className={`underline decoration-2 underline-offset-4 cursor-help font-medium px-0.5 rounded ${highlight.type === 'positive' ? 'decoration-green-400 bg-green-50 text-green-900' :
                  highlight.type === 'negative' ? 'decoration-red-400 bg-red-50 text-red-900' :
                    'decoration-orange-400 bg-orange-50 text-slate-900'
                }`}>
                {part}
              </span>

              <div className="absolute bottom-full left-0 mb-3 hidden group-hover:block w-64 z-[100]">
                <div className="bg-slate-900 text-white text-sm rounded-lg p-4 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-2 border-8 border-transparent border-t-slate-900"></div>

                  {highlight.type && (
                    <div className={`font-semibold mb-1 text-xs uppercase tracking-wide ${highlight.type === 'positive' ? 'text-green-300' :
                        highlight.type === 'negative' ? 'text-red-300' : 'text-orange-300'
                      }`}>
                      {highlight.type}
                    </div>
                  )}

                  {highlight.suggestion && (
                    <div className="text-slate-200">
                      <span className="text-slate-400 mr-2">Suggestion:</span>
                      "{highlight.suggestion}"
                    </div>
                  )}
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