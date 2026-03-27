import { useSimulation } from '../../context/SimulationContext';
import { AnimatedNumber } from '../shared/AnimatedNumber';
import { ProbabilityGauge } from './ProbabilityGauge';
import { TrendingUp, TrendingDown } from 'lucide-react';

function KPICard({ label, value, prefix = '', suffix = '', decimals = 0, trend, danger }) {
  const isDown = trend === 'down';
  return (
    <div className={`card-sm p-4 flex-1 min-w-0 flex flex-col gap-1 transition-all duration-500 ${danger ? 'border-danger/20' : ''}`}>
      <span className="text-[11px] font-medium text-text-tertiary tracking-wide uppercase">{label}</span>
      <div className="flex items-end gap-2">
        <AnimatedNumber
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          className="text-[26px] font-semibold text-text-primary leading-none tracking-tight"
        />
        {trend && (
          <span className={`flex items-center gap-0.5 text-[11px] font-medium pb-0.5 ${isDown ? 'text-danger' : 'text-success'}`}>
            {isDown ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
          </span>
        )}
      </div>
    </div>
  );
}

export function KPIPanel() {

  const { kpis, crisisIntensity } = useSimulation();
  const ci = crisisIntensity;

  return (
    <div className="flex gap-3 items-stretch">
      {/* PoS Gauge — F-pattern top-left anchor */}
      <div className="card-sm p-4 flex items-center gap-4 min-w-[190px]">
        <ProbabilityGauge value={kpis.pos} size={76} />
        <div>
          <span className="text-[10px] font-medium text-text-tertiary tracking-wide uppercase block leading-tight">
            Probability
          </span>
          <span className="text-[10px] font-medium text-text-tertiary tracking-wide uppercase block leading-tight">
            of Success
          </span>
        </div>
      </div>
      <KPICard label="Market Share" value={kpis.marketShare} suffix="%" decimals={1} trend={ci > 0.3 ? 'down' : 'up'} danger={ci > 0.5} />
      <KPICard label="Revenue" value={kpis.revenue} prefix="₹" trend={ci > 0.2 ? 'down' : 'up'} danger={ci > 0.6} />
      <KPICard label="Monthly Burn" value={kpis.cashBurn} prefix="₹" trend={ci > 0.2 ? 'down' : null} />
      <KPICard label="Agent Churn" value={kpis.churn} trend={ci > 0.3 ? 'down' : null} danger={kpis.churn > 12} />
      <KPICard label="Active Agents" value={kpis.activeAgents} trend={ci > 0.3 ? 'down' : 'up'} />
    </div>
  );
}
