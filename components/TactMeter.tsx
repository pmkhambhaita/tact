import React, { useEffect, useState } from 'react';

interface TactMeterProps {
  score: number;
}

const TactMeter: React.FC<TactMeterProps> = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Simple animation for the needle
    const timeout = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timeout);
  }, [score]);

  // Calculate rotation: 0 score = -90deg, 100 score = 90deg
  const rotation = (animatedScore / 100) * 180 - 90;

  // Determine color based on score
  const getColor = (s: number) => {
    if (s < 40) return '#f97316'; // Orange-500
    if (s < 75) return '#fb923c'; // Orange-400
    return '#1e293b'; // Slate-800 (Good)
  };

  const color = getColor(animatedScore);

  return (
    <div className="relative w-48 h-24 overflow-hidden">
      {/* Background Arc */}
      <div className="absolute w-40 h-40 bg-slate-100 rounded-full top-4 left-4 border-[16px] border-slate-100 box-border"></div>
      
      {/* Colored Arc (This is a simplified visual representation) */}
      {/* Using SVG for better control over the stroke dasharray for a semi-circle is usually preferred, 
          but keeping it simple with CSS rotation logic for the needle. */}
      
      <svg className="absolute top-4 left-4 w-40 h-40" viewBox="0 0 100 100">
         <path 
            d="M 10,50 A 40,40 0 1,1 90,50" 
            fill="none" 
            stroke="#e2e8f0" 
            strokeWidth="12"
            strokeLinecap="round"
         />
         <path 
            d="M 10,50 A 40,40 0 1,1 90,50" 
            fill="none" 
            stroke={color} 
            strokeWidth="12"
            strokeDasharray={`${(animatedScore / 100) * 126} 200`} // Approx circumference for dash
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
         />
      </svg>

      {/* Needle */}
      <div 
        className="absolute bottom-0 left-1/2 w-1 h-20 bg-slate-800 origin-bottom rounded-full transition-transform duration-1000 ease-out z-10"
        style={{ 
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            bottom: '4px' // Adjust for visual alignment
        }}
      >
        <div className="w-3 h-3 bg-slate-800 rounded-full absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Score Text */}
      <div className="absolute bottom-0 left-0 w-full text-center z-20">
        <span className="text-3xl font-bold text-slate-900">{animatedScore}</span>
      </div>
    </div>
  );
};

export default TactMeter;