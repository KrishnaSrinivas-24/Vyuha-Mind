import { useSimulation } from '../../context/SimulationContext';
import { Panel } from '../shared/Panel';
import { useEffect, useRef } from 'react';

const TYPE_COLORS = {
  consumer: '#0ea5e9', // sky for consumer
  competitor: '#ef4444', // red for competitor
  analyst: '#f59e0b', // amber for analyst
  investor: '#10b981', // emerald for investor
  orchestrator: '#06b6d4', // cyan for orchestrator
};

const TYPE_LABELS = {
  consumer: 'Customer',
  competitor: 'Competitor',
  analyst: 'Analyst',
  investor: 'Investor',
  orchestrator: 'Orchestrator',
};

const SENTIMENT_COLORS = {
  positive: '#059669',
  negative: '#dc2626',
  warning: '#d97706',
  aggressive: '#ea580c',
  neutral: '#6b7280',
};

const MODE_LABELS = {
  adk: 'AI',
  grok: 'GROK',
  free_market_intel: 'LIVE',
  deterministic: 'DET',
  deterministic_defaults: 'DET',
  unknown: '?',
};

function ModeBadge({ mode }) {
  if (!mode) return null;
  const label = MODE_LABELS[mode] || mode.slice(0, 4).toUpperCase();
  const isAI = mode === 'adk' || mode === 'grok' || mode === 'free_market_intel';
  return (
    <span
      className={`px-1 py-px rounded text-[8px] font-bold tracking-wider uppercase ${
        isAI
          ? 'bg-primary/20 text-primary-light border border-primary/30'
          : 'bg-surface-raised text-text-muted border border-border'
      }`}
    >
      {label}
    </span>
  );
}

function MetaChips({ meta }) {
  if (!meta) return null;
  const chips = [];
  if (meta.demand) chips.push({ label: 'Demand', value: meta.demand });
  if (meta.sentiment && meta.sentiment !== 'neutral') chips.push({ label: 'Mood', value: meta.sentiment });
  if (meta.strategy) chips.push({ label: 'Strat', value: meta.strategy });
  if (meta.action && meta.action !== 'none') chips.push({ label: 'Act', value: meta.action });
  if (meta.competition) chips.push({ label: 'Comp', value: meta.competition });
  if (meta.price) chips.push({ label: 'Price', value: meta.price });
  if (meta.verdict) chips.push({ label: 'Verdict', value: meta.verdict.toUpperCase() });
  if (meta.confidence) chips.push({ label: 'Conf', value: meta.confidence });
  if (meta.risk) chips.push({ label: 'Risk', value: meta.risk });
  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1.5 pl-3.5">
      {chips.map((chip, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface/40 border border-border text-[9px] font-mono"
        >
          <span className="text-text-muted">{chip.label}:</span>
          <span className="text-text-main font-semibold">{chip.value}</span>
        </span>
      ))}
    </div>
  );
}

export function AgentLogs() {
  const { state } = useSimulation();
  const scrollRef = useRef(null);
  const logs = state.agentLogs || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length]);

  return (
    <Panel className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-bold text-text-main tracking-tight">Agent Activity</h2>
        <span className="text-[11px] text-text-faint font-mono">{logs.length} logs</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scroll space-y-0 pr-2">
        {logs.length === 0 ? (
          <p className="text-text-muted text-[12px] text-center py-8">
            {state.loading ? 'Running simulation pipeline...' : 'Start the simulation to see agent reasoning...'}
          </p>
        ) : (
          logs.slice(-40).map((log, i) => (
            <div
              key={log.id || i}
              className="py-3 border-b border-border/50 last:border-0 animate-fade-in"
            >
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {/* Sentiment dot */}
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: SENTIMENT_COLORS[log.sentiment] || SENTIMENT_COLORS.neutral }}
                />
                {/* Agent type label */}
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: TYPE_COLORS[log.agentType] || '#9ca3b0' }}
                >
                  {TYPE_LABELS[log.agentType] || log.agentType}
                </span>
                <span className="text-border text-[11px]">·</span>
                {/* Agent name */}
                <span className="text-text-muted text-[11px]">{log.agentName}</span>
                {/* Execution mode badge */}
                <ModeBadge mode={log.executionMode} />
                {/* Tick */}
                <span className="text-text-faint text-[10px] ml-auto font-mono flex-shrink-0">T{log.tick}</span>
              </div>
              {/* Message — supports multi-line */}
              <p className="text-[12px] text-text-muted leading-relaxed pl-3.5 whitespace-pre-line">
                {log.message}
              </p>
              {/* Meta chips */}
              <MetaChips meta={log.meta} />
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}
