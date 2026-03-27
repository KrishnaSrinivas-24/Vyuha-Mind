import React, { useRef, useEffect, useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';

export function AgentReasoningLog() {
  const { agentLogs } = useSimulation();

  return (
    <div className="flex flex-col h-full bg-slate-950/20 rounded-md p-2 font-mono text-xs">
      <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-700 text-gray-400">
        <h3 className="uppercase tracking-widest font-bold">AI Node Intercom</h3>
        <span className="text-[10px] animate-pulse text-green-500">SYS_ACTIVE</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 flex flex-col-reverse">
        {agentLogs?.map((log) => (
           <div key={log.id || Math.random()} className={`p-2 rounded bg-slate-900/50 border-l-2 ${log.sentiment === 'negative' ? 'border-red-500 text-red-200' : log.sentiment === 'positive' ? 'border-green-500 text-green-200' : 'border-slate-500 text-slate-300'}`}>
             <div className="font-bold mb-1 opacity-70">[{log.agentName || log.agentType || 'SYS'}]</div>
             <div className="whitespace-pre-wrap">{log.message || log.content || ''}</div>
           </div>
        ))}
      </div>
    </div>
  );
}
