import { useSimulation } from '../../context/SimulationContext';
import { SimulationControls } from '../controls/SimulationControls';
import { Cpu, AlertTriangle, Settings, LogOut } from 'lucide-react';

export function Header({ onOpenConfig, onExit, productName }) {
  const { state } = useSimulation();
  const isCrisis = state.crisisActive;

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-5 bg-bg-surface/90 backdrop-blur-md relative z-50">
      {/* Left: Branding + Status Pills */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-bg border border-border-accent flex items-center justify-center">
            <Cpu size={16} className="text-accent-bright" />
          </div>
          <div>
            <h1 className="text-[13px] font-bold text-text-primary leading-tight">
              {productName || 'AI04'}
            </h1>
            <p className="text-[9px] text-text-muted font-semibold tracking-[0.12em]">STRATEGY SIMULATOR</p>
          </div>
        </div>

        <div className="h-5 w-px bg-border mx-1" />

        {/* Traffic Light Status Pills */}
        <div className="flex items-center gap-1.5">
          {Object.entries(state.statusLights).map(([key, status]) => {
            const labels = { supplyChain: 'Supply', sentiment: 'Sentiment', competitors: 'Market', financial: 'Finance' };
            const colors = { green: 'bg-success', yellow: 'bg-warning', red: 'bg-danger' };
            return (
              <div key={key} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-elevated/60">
                <div className={`w-1.5 h-1.5 rounded-full ${colors[status]} ${status === 'red' ? 'animate-pulse-subtle' : ''}`} />
                <span className="text-[10px] font-medium text-text-muted">{labels[key]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center: Simulation Controls */}
      <SimulationControls />

      {/* Right: Crisis Badge + Status + Actions */}
      <div className="flex items-center gap-2">
        {isCrisis && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-danger-dim border border-danger/15">
            <AlertTriangle size={12} className="text-danger" />
            <span className="text-[10px] font-bold text-danger tracking-wide animate-pulse-subtle">CRISIS</span>
          </div>
        )}

        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${state.running ? 'bg-success-dim' : 'bg-bg-elevated'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${state.running ? 'bg-success animate-pulse-subtle' : 'bg-text-muted'}`} />
          <span className={`text-[10px] font-semibold ${state.running ? 'text-success' : 'text-text-muted'}`}>
            {state.running ? 'LIVE' : 'IDLE'}
          </span>
        </div>

        <button onClick={onOpenConfig} className="p-1.5 rounded-lg hover:bg-bg-elevated transition-colors cursor-pointer" title="Settings">
          <Settings size={16} className="text-text-tertiary" />
        </button>
        <button onClick={onExit} className="p-1.5 rounded-lg hover:bg-bg-elevated transition-colors cursor-pointer" title="Exit to Setup">
          <LogOut size={16} className="text-text-tertiary" />
        </button>
      </div>

      {/* Bottom accent line */}
      {isCrisis 
        ? <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-danger/40 to-transparent" />
        : <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent" />
      }
    </header>
  );
}
