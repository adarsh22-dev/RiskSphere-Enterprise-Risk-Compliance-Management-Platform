import React from 'react';
import { Risk } from '../types';

interface RiskHeatmapProps {
  risks: Risk[];
}

const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ risks }) => {
  const grid = Array(5).fill(null).map(() => Array(5).fill(0));

  risks.forEach(risk => {
    // Likelihood and Impact are 1-5
    const l = Math.min(Math.max(risk.likelihood - 1, 0), 4);
    const i = Math.min(Math.max(risk.impact - 1, 0), 4);
    grid[4 - l][i]++; // 4-l to invert Y axis (high likelihood at top)
  });

  const getCellColor = (l: number, i: number) => {
    const score = (5 - l) * (i + 1);
    if (score >= 20) return 'bg-red-500';
    if (score >= 12) return 'bg-orange-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Risk Heatmap</h3>
      <div className="flex">
        {/* Y-Axis Label */}
        <div className="flex flex-col justify-between py-8 pr-4 text-[10px] font-bold text-slate-400 uppercase [writing-mode:vertical-lr] rotate-180">
          <span>High Likelihood</span>
          <span>Low Likelihood</span>
        </div>
        
        <div className="flex-1">
          <div className="grid grid-cols-5 gap-1 aspect-square">
            {grid.map((row, lIdx) => (
              row.map((count, iIdx) => (
                <div 
                  key={`${lIdx}-${iIdx}`}
                  className={`${getCellColor(lIdx, iIdx)} rounded-sm flex items-center justify-center text-white font-bold text-sm transition-transform hover:scale-105 cursor-default relative group`}
                >
                  {count > 0 && count}
                  {count > 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                      {count} Risk{count > 1 ? 's' : ''} (L:{5-lIdx}, I:{iIdx+1})
                    </div>
                  )}
                </div>
              ))
            ))}
          </div>
          
          {/* X-Axis Label */}
          <div className="flex justify-between pt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Low Impact</span>
            <span>High Impact</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
          <span>High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
          <span>Low</span>
        </div>
      </div>
    </div>
  );
};

export default RiskHeatmap;
