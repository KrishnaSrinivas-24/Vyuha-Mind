import { useSimulation } from '../../context/SimulationContext';
import { Panel } from '../shared/Panel';

const STRATEGY_COLORS = {
  MAINTAIN: { bg: 'rgba(52,211,153,0.12)', text: '#34D399', label: 'Holding' },
  PREDATORY_PRICING: { bg: 'rgba(248,113,113,0.12)', text: '#F87171', label: 'Predatory' },
  COST_PASSING: { bg: 'rgba(251,191,36,0.12)', text: '#FBBF24', label: 'Cost Pass' },
  BANKRUPTCY: { bg: 'rgba(248,113,113,0.2)', text: '#F87171', label: 'Bankrupt' },
};

export function CompetitorMatrix() {
  const { state } = useSimulation();
  const comps = state.competitors;
  if (!comps || comps.length === 0) return null;

  return (
    <Panel className="h-full flex flex-col overflow-hidden">
      <h2 className="text-[13px] font-semibold text-text-primary mb-3">Competitor Intel</h2>
      <div className="flex-1 overflow-auto custom-scroll space-y-2">
        {comps.map((c) => {
          const strat = STRATEGY_COLORS[c.strategy] || STRATEGY_COLORS.MAINTAIN;
          return (
            <div
              key={c.id}
              className={`card-sm p-3 transition-all duration-500 ${!c.alive ? 'opacity-40' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.alive ? strat.text : '#4A4F75' }} />
                  <span className="text-[12px] font-semibold text-text-primary">{c.name}</span>
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
                  <span className="text-text-secondary font-mono font-medium">₹{c.price}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Share</span>
                  <span className="text-text-secondary font-mono font-medium">{c.marketShare}%</span>
                </div>
                <div>
                  <span className="text-text-muted block">Runway</span>
                  <span className="text-text-secondary font-mono font-medium">{c.cashReserveMonths}mo</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
