import { useSimulation } from '../../context/SimulationContext';
import { Panel } from '../shared/Panel';
import { AlertTriangle, Zap, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export function ScenarioInjector() {
  const { state, actions } = useSimulation();
  const [severity, setSeverity] = useState(1.0);
  const isCrisis = state.crisisActive;

  return (
    <Panel>
      <h2 className="text-[13px] font-semibold text-text-primary mb-3">Scenario Injection</h2>

      {!isCrisis ? (
        <>
          <div className="card-sm p-3 mb-3 gradient-bg">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-warning mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[12px] font-semibold text-text-primary">March 2026 LPG Crisis</p>
                <p className="text-[10px] text-text-tertiary mt-0.5 leading-relaxed">
                  Hormuz closure · 95% supply halt · 10L/day fuel cap · Oil +45%
                </p>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-text-muted font-medium">Severity</span>
              <span className="text-text-primary font-mono font-semibold">{Math.round(severity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={severity}
              onChange={(e) => setSeverity(parseFloat(e.target.value))}
              className="w-full"
              style={{
                background: `linear-gradient(to right, #FBBF24 0%, #F87171 ${severity * 100}%, rgba(140,140,200,0.08) ${severity * 100}%)`,
              }}
            />
          </div>

          <button
            onClick={() => actions.injectCrisis(severity)}
            className="w-full py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 bg-danger-dim border border-danger/20 text-danger hover:bg-danger/15"
          >
            <Zap size={14} /> Inject Crisis
          </button>
        </>
      ) : (
        <>
          <div className="card-sm p-3 mb-3 bg-danger-dim border-danger/15">
            <p className="text-[11px] font-semibold text-danger mb-1">Crisis Active</p>
            <p className="text-[10px] text-text-tertiary leading-relaxed">
              LPG supply chains disrupted. Consumer agents panicking. Competitor agents deploying counter-strategies.
            </p>
          </div>

          <div className="text-center text-[11px] text-text-muted mb-2 font-mono">
            Intensity: {Math.round(state.crisisIntensity * 100)}%
          </div>

          <button
            onClick={actions.resolveCrisis}
            className="w-full py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 bg-success-dim border border-success/20 text-success hover:bg-success/15"
          >
            <CheckCircle size={14} /> Resolve Crisis
          </button>
        </>
      )}
    </Panel>
  );
}
