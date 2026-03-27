import { useSimulation } from '../../context/SimulationContext';
import { Panel } from '../shared/Panel';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, ReferenceLine
} from 'recharts';
import { useState } from 'react';

const TABS = [
  { id: 'equilibrium', label: 'Equilibrium' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'revenue', label: 'Revenue' },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div className="card-sm p-3 text-[12px] shadow-xl border-border-hover">
      <p className="text-text-tertiary mb-1 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex justify-between gap-6">
          <span className="text-text-secondary">{p.name}</span>
          <span className="font-mono font-medium" style={{ color: p.color }}>
            {typeof p.value === 'number' ? p.value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

const AXIS = { fill: '#6B72A0', fontSize: 11 };
const AXIS_LINE = { stroke: 'rgba(140,140,200,0.06)' };
const GRID = { strokeDasharray: '3 3', stroke: 'rgba(140,140,200,0.05)' };

function EquilibriumChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="dGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#818CF8" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#818CF8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="sGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F472B6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#F472B6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="price" tick={AXIS} axisLine={AXIS_LINE} tickFormatter={v => `₹${v}`} />
        <YAxis tick={AXIS} axisLine={AXIS_LINE} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="demand" stroke="#818CF8" fill="url(#dGrad)" strokeWidth={2.5} name="Demand" dot={false} animationDuration={800} />
        <Area type="monotone" dataKey="supply" stroke="#F472B6" fill="url(#sGrad)" strokeWidth={2.5} name="Supply" dot={false} animationDuration={800} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function TimelineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34D399" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="day" tick={AXIS} axisLine={AXIS_LINE} />
        <YAxis yAxisId="left" tick={AXIS} axisLine={AXIS_LINE} />
        <YAxis yAxisId="right" orientation="right" tick={AXIS} axisLine={AXIS_LINE} />
        <Tooltip content={<CustomTooltip />} />
        <Area yAxisId="left" type="monotone" dataKey="pos" stroke="#34D399" fill="url(#posGrad)" strokeWidth={2} name="PoS %" dot={false} animationDuration={800} />
        <Line yAxisId="left" type="monotone" dataKey="marketShare" stroke="#818CF8" strokeWidth={1.5} name="Share %" dot={false} animationDuration={800} />
        <Bar yAxisId="right" dataKey="sentiment" fill="rgba(139,92,246,0.2)" name="Sentiment" radius={[2, 2, 0, 0]} animationDuration={800} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function RevenueChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#818CF8" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#818CF8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="day" tick={AXIS} axisLine={AXIS_LINE} />
        <YAxis tick={AXIS} axisLine={AXIS_LINE} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="revenue" stroke="#818CF8" fill="url(#revGrad)" strokeWidth={2.5} name="Revenue ₹" dot={false} animationDuration={800} />
        <ReferenceLine y={300000} stroke="#F87171" strokeDasharray="4 4" strokeWidth={1}
          label={{ value: 'Break-even', fill: '#F87171', fontSize: 11 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function MarketArena() {
  const { state } = useSimulation();
  const [activeTab, setActiveTab] = useState('equilibrium');

  return (
    <Panel className="h-full flex flex-col" padding={false}>
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h2 className="text-[13px] font-semibold text-text-primary">Market Arena</h2>
        <div className="flex gap-0.5 rounded-lg bg-bg-elevated p-0.5">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${
                activeTab === tab.id ? 'bg-bg-hover text-text-primary' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 px-3 pb-3 min-h-0">
        {activeTab === 'equilibrium' && <EquilibriumChart data={state.demandSupply} />}
        {activeTab === 'timeline' && <TimelineChart data={state.historicalData} />}
        {activeTab === 'revenue' && <RevenueChart data={state.historicalData} />}
      </div>
    </Panel>
  );
}
