import React from 'react';
import { useSimulation } from '../../context/SimulationContext';

export default function StatusIndicator() {
  const { statusLights } = useSimulation();

  if (!statusLights) return null;

  const renderLight = (color) => {
    const baseClass = "w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]";
    if (color === 'red') return <div className={`${baseClass} bg-red-500 text-red-500 animate-pulse`}></div>;
    if (color === 'yellow') return <div className={`${baseClass} bg-yellow-500 text-yellow-500`}></div>;
    return <div className={`${baseClass} bg-green-500 text-green-500`}></div>;
  };

  return (
    <div className="flex gap-4 items-center">
       {Object.entries(statusLights).map(([key, color]) => (
         <div key={key} className="flex items-center gap-2 flex-col">
           {renderLight(color)}
           <span className="text-[8px] uppercase text-slate-400 font-mono">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
         </div>
       ))}
    </div>
  );
}
