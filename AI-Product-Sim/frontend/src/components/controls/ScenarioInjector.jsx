import { useSimulation } from '../../context/SimulationContext';
import { Panel } from '../shared/Panel';
import { AlertTriangle, Zap, CheckCircle, Fuel } from 'lucide-react';
import { useState } from 'react';

const SCENARIOS = [
  {
    id: 'lpg',
    name: 'March 2026 LPG Crisis',
    desc: 'Hormuz closure · 95% supply halt · 10L/day fuel cap · Oil +45%',
    type: 'Macro Shock',
    color: 'text-danger',
  },
  {
    id: 'e10',
    name: 'E10/E20 Fuel Transition',
    desc: 'Ethanol mandate · Legacy vehicle corrosion · OEM counter-kits',
    type: 'Regulatory Shift',
    color: 'text-warning',
  },
];

export function ScenarioInjector() {
  const { state, actions } = useSimulation();
  const [severity, setSeverity] = useState(1.0);
  const [selectedScenario, setSelectedScenario] = useState('lpg');
  const isCrisis = state.crisisActive;

  return (
    <Panel>
      <h2 className="text-[13px] font-semibold text-text-main mb-3">Scenario Injection</h2>

      {!isCrisis ? (
        <>
          {/* Scenario Selector */}
          <div className="space-y-2 mb-3">
            {SCENARIOS.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedScenario(s.id)}
                className={`glass-card p-3 cursor-pointer transition-all duration-200 ${
                  selectedScenario === s.id
                    ? 'border-primary/30 bg-primary/5'
                    : 'hover:border-border'
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle size={12} className={`${s.color} mt-0.5 flex-shrink-0`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-semibold text-text-main">{s.name}</p>
                      {selectedScenario === s.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-light" />
                      )}
                    </div>
                    <p className="text-[9px] text-text-faint mt-0.5 leading-relaxed">{s.desc}</p>
                    <span className="text-[8px] font-mono text-text-faint uppercase tracking-wider">{s.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-text-muted font-medium">Severity</span>
              <span className="text-text-main font-mono font-semibold">{Math.round(severity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={severity}
              onChange={(e) => setSeverity(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={() => actions.injectCrisis(severity)}
            className="w-full py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 bg-danger/10 border border-danger/20 text-danger hover:bg-danger/20 glow-danger"
          >
            <Zap size={14} /> Inject {SCENARIOS.find(s => s.id === selectedScenario)?.name}
          </button>
        </>
      ) : (
        <>
          <div className="neo-panel p-3 mb-3 bg-danger/5 border-danger/20 crisis-border">
            <p className="text-[11px] font-semibold text-danger mb-1">Crisis Active</p>
            <p className="text-[10px] text-text-faint leading-relaxed">
              Market disrupted. Consumer agents in survival mode. Competitor agents deploying counter-strategies.
            </p>
          </div>

          <div className="text-center text-[11px] text-text-muted mb-2 font-mono">
            Intensity: {Math.round(state.crisisIntensity * 100)}%
          </div>

          <button
            onClick={actions.resolveCrisis}
            className="w-full py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 bg-success/10 border border-success/20 text-success hover:bg-success/20 glow-success"
          >
            <CheckCircle size={14} /> Resolve Crisis
          </button>
        </>
      )}
    </Panel>
  );
}
