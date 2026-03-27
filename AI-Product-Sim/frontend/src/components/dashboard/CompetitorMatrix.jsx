import { useSimulation } from '../../context/SimulationContext';
import { Panel } from '../shared/Panel';

const STRATEGY_COLORS = {
  MAINTAIN: { bg: 'rgba(16,185,129,0.12)', text: '#10b981', label: 'Holding' },
  PREDATORY_PRICING: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', label: 'Predatory' },
  COST_PASSING: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', label: 'Cost Pass' },
  BANKRUPTCY: { bg: 'rgba(239,68,68,0.2)', text: '#ef4444', label: 'Bankrupt' },
};

export function CompetitorMatrix() {
  const { state } = useSimulation();
  const comps = state.competitors;
  if (!comps || comps.length === 0) return null;

  return (
    <Panel className="h-full flex flex-col overflow-hidden">
      <h2 className="text-[13px] font-bold text-text-main mb-3 tracking-tight">Competitor Intel</h2>
      <div className="flex-1 overflow-auto custom-scroll space-y-2">
        {comps.map((c) => {
          const strat = STRATEGY_COLORS[c.strategy] || STRATEGY_COLORS.MAINTAIN;
          return (
            <div
              key={c.id}
              className={`glass-card p-3 transition-all duration-500 ${!c.alive ? 'opacity-40' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full glow-primary" style={{ backgroundColor: c.alive ? strat.text : '#4a5568' }} />
                  <span className="text-[12px] font-semibold text-text-main">{c.name}</span>
                </div>
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: strat.bg, color: strat.text }}
                >
                  {strat.label}
                </span>
              </div>
              <div className="flex gap-4 text-[11px]">
                <div>
                  <span className="text-text-muted block">Price</span>
                  <span className="text-text-main font-mono font-medium">₹{c.price}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Share</span>
                  <span className="text-text-main font-mono font-medium">{c.marketShare}%</span>
                </div>
                <div>
                  <span className="text-text-muted block">Runway</span>
                  <span className="text-text-main font-mono font-medium">{c.cashReserveMonths}mo</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
