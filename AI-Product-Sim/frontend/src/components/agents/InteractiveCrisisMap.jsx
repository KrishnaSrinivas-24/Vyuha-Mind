import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';

export default function InteractiveCrisisMap() {
  const { resolveCrisis } = useSimulation();
  const [budget, setBudget] = useState(500);

  return (
    <div className="mt-2 p-3 bg-red-950/40 border border-red-500/50 rounded-md shadow-[0_0_15px_rgba(239,68,68,0.2)]">
      <h4 className="text-red-400 font-bold uppercase text-xs mb-2 flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        Emergency Injector
      </h4>
      <p className="text-[10px] text-gray-300 mb-3">Adjust Budget to mitigate churn.</p>

      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
          <span>$100K</span>
          <span className="text-red-300 font-bold">${budget}K</span>
          <span>$1000K</span>
        </div>
        <input
          type="range"
          min="100"
          max="1000"
          value={budget}
          onChange={e => setBudget(e.target.value)}
          className="w-full accent-red-500"
        />
      </div>

      <button
        onClick={() => resolveCrisis(budget)}
        className="w-full py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500 text-red-100 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
      >
        DEPLOY SUBSIDY
      </button>
    </div>
  );
}
