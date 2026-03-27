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
    <div className="bg-surface border border-border rounded-xl p-3 text-[12px] shadow-xl">
      <p className="text-text-main mb-1 font-semibold">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex justify-between gap-6">
          <span className="text-text-muted">{p.name}</span>
          <span className="font-mono font-semibold" style={{ color: p.color }}>
            {typeof p.value === 'number' ? p.value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

const AXIS = { fill: '#8b95a5', fontSize: 11 };
const AXIS_LINE = { stroke: '#1e2536' };
const GRID = { strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.04)' };

function EquilibriumChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="dGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="sGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="price" tick={AXIS} axisLine={AXIS_LINE} tickFormatter={v => `₹${v}`} />
        <YAxis tick={AXIS} axisLine={AXIS_LINE} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="demand" stroke="#0ea5e9" fill="url(#dGrad)" strokeWidth={2.5} name="Demand" dot={false} animationDuration={800} />
        <Area type="monotone" dataKey="supply" stroke="#06b6d4" fill="url(#sGrad)" strokeWidth={2.5} name="Supply" dot={false} animationDuration={800} />
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
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="day" tick={AXIS} axisLine={AXIS_LINE} />
        <YAxis yAxisId="left" tick={AXIS} axisLine={AXIS_LINE} />
        <YAxis yAxisId="right" orientation="right" tick={AXIS} axisLine={AXIS_LINE} />
        <Tooltip content={<CustomTooltip />} />
        <Area yAxisId="left" type="monotone" dataKey="pos" stroke="#10b981" fill="url(#posGrad)" strokeWidth={2} name="PoS %" dot={false} animationDuration={800} />
        <Line yAxisId="left" type="monotone" dataKey="marketShare" stroke="#0ea5e9" strokeWidth={1.5} name="Share %" dot={false} animationDuration={800} />
        <Bar yAxisId="right" dataKey="sentiment" fill="rgba(14,165,233,0.15)" name="Sentiment" radius={[3, 3, 0, 0]} animationDuration={800} />
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
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="day" tick={AXIS} axisLine={AXIS_LINE} />
        <YAxis tick={AXIS} axisLine={AXIS_LINE} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" fill="url(#revGrad)" strokeWidth={2.5} name="Revenue ₹" dot={false} animationDuration={800} />
        <ReferenceLine y={300000} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1}
          label={{ value: 'Break-even', fill: '#ef4444', fontSize: 11 }}
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
        <h2 className="text-[14px] font-bold text-text-main tracking-tight">Market Arena</h2>
        <div className="flex gap-0.5 rounded-xl bg-surface-raised p-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                activeTab === tab.id ? 'bg-primary/20 text-primary-light' : 'text-text-muted hover:text-text-main'
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
