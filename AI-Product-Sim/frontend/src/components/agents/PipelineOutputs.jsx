import { useSimulation } from '../../context/SimulationContext';
import { Panel } from '../shared/Panel';

function JsonBlock({ title, value }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="text-[10px] uppercase tracking-wider text-text-faint mb-1">{title}</div>
      <pre className="text-[10px] leading-relaxed bg-surface-raised border border-border rounded-lg p-2 overflow-auto max-h-32 custom-scroll text-text-muted">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

export function PipelineOutputs() {
  const { state } = useSimulation();
  const outputs = state.pipelineOutputs;

  return (
    <Panel className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-semibold text-text-main">Engine Outputs</h2>
        <span className="text-[10px] text-text-faint font-mono">6 stages</span>
      </div>

      {state.loading ? (
        <p className="text-[12px] text-text-muted">Loading simulation output...</p>
      ) : state.error ? (
        <p className="text-[12px] text-danger">{state.error}</p>
      ) : !outputs ? (
        <p className="text-[12px] text-text-muted">No pipeline output available yet.</p>
      ) : (
        <div className="flex-1 overflow-auto custom-scroll pr-1">
          <JsonBlock title="Input Handler" value={outputs.input_handler} />
          <JsonBlock title="Orchestrator" value={outputs.orchestrator} />
          <JsonBlock title="Market Analyzer Agent" value={outputs.market_analyzer_agent} />
          <JsonBlock title="Simulation Loop" value={outputs.simulation_loop} />
          <JsonBlock title="Evaluation Engine" value={outputs.evaluation_engine} />
          <JsonBlock title="Recommendation Engine" value={outputs.recommendation_engine} />
        </div>
      )}
    </Panel>
  );
}
