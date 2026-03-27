import { useState } from 'react';
import { Zap, Shield, BarChart3, Brain, Globe, ChevronRight, Activity, Target, Layers, Hexagon } from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: 'Multi-Agent AI Simulation',
    desc: 'Deploy 50+ autonomous LLM agents — consumers, competitors, investors — reasoning in parallel to simulate real market dynamics.',
    gradient: 'from-sky-500/15 to-cyan-500/8',
    iconColor: 'text-primary-light',
  },
  {
    icon: Zap,
    title: 'Real-Time Crisis Testing',
    desc: 'Inject macroeconomic shocks like the March 2026 LPG Crisis and watch your strategy adapt or collapse — live on dashboard.',
    gradient: 'from-rose-500/15 to-orange-500/8',
    iconColor: 'text-danger',
  },
  {
    icon: BarChart3,
    title: 'Predictive Intelligence',
    desc: 'Monte Carlo simulations + Bayesian PoS scoring quantify product viability across thousands of parallel market scenarios.',
    gradient: 'from-emerald-500/15 to-teal-500/8',
    iconColor: 'text-success',
  },
];

const METRICS = [
  { value: '50+', label: 'Autonomous Agents' },
  { value: '<15s', label: 'Deliberation Cycle' },
  { value: '1000+', label: 'Monte Carlo Runs' },
  { value: '6', label: 'Scenario Templates' },
];

export function LandingPage({ onStart }) {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  return (
    <div className="min-h-screen bg-base text-text-main overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-sky-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-600/3 rounded-full blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-lg">
            <Hexagon size={18} className="text-primary-light" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight">Vyuha-Mind</span>
            <span className="text-text-faint text-[10px] ml-2 font-mono tracking-widest">ENGINE</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-text-muted text-sm hidden md:block">Product Strategy Simulator</span>
          <div className="flex items-center gap-2 text-[11px] font-mono text-success">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-subtle" />
            SYSTEM ONLINE
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pt-16 pb-20 text-center">
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface/50 text-[11px] font-mono text-text-muted mb-8">
            <Activity size={12} className="text-primary-light" />
            MMARP FRAMEWORK • CRISIS SIMULATION ENGINE
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-light tracking-tight leading-[1.1] mb-6 animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          Simulate Markets.{' '}
          <span className="gradient-text font-bold">Predict Outcomes.</span>
        </h1>

        <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          The autonomous strategy engine that deploys LLM-powered agents to stress-test your product against real market chaos — before you ship.
        </p>

        <div className="flex items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
          <button
            onClick={onStart}
            className="neo-btn bg-primary hover:bg-primary-light text-white px-8 py-4 text-base font-bold rounded-xl glow-primary group"
          >
            <Zap size={18} className="group-hover:animate-pulse-subtle" />
            Launch Simulator
            <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
          <a href="#features" className="neo-btn bg-surface-raised border border-border text-text-muted hover:text-text-main px-6 py-4 rounded-xl">
            How It Works
          </a>
        </div>

        {/* Metrics Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
          {METRICS.map((m, i) => (
            <div key={i} className="glass-panel px-5 py-4 text-center">
              <div className="text-2xl font-bold gradient-text font-mono">{m.value}</div>
              <div className="text-[11px] font-mono text-text-faint mt-1 uppercase tracking-wider">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pb-20">
        <div className="glass-panel p-1.5 rounded-2xl overflow-hidden animate-border-glow">
          <div className="bg-surface rounded-xl p-6 md:p-8">
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
              {['PoS: 72%', 'Share: 34.2%', 'Churn: 8%', 'Revenue: ₹4.2L', 'Agents: 58'].map((kpi, i) => (
                <div key={i} className="glass-card px-3 py-2.5 text-center">
                  <div className="text-xs font-mono text-text-main">{kpi}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <div className="flex-1 h-40 bg-surface-raised rounded-lg border border-border flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 size={32} className="text-primary/30 mx-auto mb-2" />
                  <span className="text-[11px] font-mono text-text-faint">DEMAND × SUPPLY EQUILIBRIUM</span>
                </div>
              </div>
              <div className="w-48 h-40 bg-surface-raised rounded-lg border border-border flex items-center justify-center">
                <div className="text-center">
                  <Activity size={28} className="text-accent-cyan/30 mx-auto mb-2" />
                  <span className="text-[10px] font-mono text-text-faint">AGENT TELEMETRY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-8 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
            Enterprise-Grade <span className="gradient-text font-bold">Market Intelligence</span>
          </h2>
          <p className="text-text-muted max-w-xl mx-auto">
            From micro-level agent cognition to macro-level supply chain disruption — simulate the full spectrum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className={`glass-card p-8 transition-all duration-300 cursor-default ${hoveredFeature === i ? 'scale-[1.02] border-primary/30' : ''}`}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 border border-white/5`}>
                <f.icon size={22} className={f.iconColor} />
              </div>
              <h3 className="text-lg font-bold mb-3 tracking-tight">{f.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture Strip */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pb-24">
        <div className="glass-panel p-8 md:p-10">
          <h3 className="text-sm font-mono text-text-faint mb-8 tracking-widest uppercase">Core Architecture</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Layers, name: 'FastAPI + LangGraph', desc: 'Agent orchestration' },
              { icon: Globe, name: 'WebSocket Streaming', desc: 'Real-time telemetry' },
              { icon: Shield, name: 'A2UI Protocol', desc: 'Declarative agent UI' },
              { icon: Target, name: 'Monte Carlo Engine', desc: 'Distribution analysis' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-surface-raised border border-border flex items-center justify-center shrink-0 mt-0.5">
                  <item.icon size={15} className="text-primary-light" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{item.name}</div>
                  <div className="text-[11px] text-text-faint mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 pb-24 text-center">
        <div className="glass-card p-12 md:p-16">
          <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
            Ready to <span className="gradient-text font-bold">Stress-Test</span> Your Strategy?
          </h2>
          <p className="text-text-muted mb-8 max-w-lg mx-auto">
            Configure your product. Deploy agents. Inject the crisis. Watch the market react in real-time.
          </p>
          <button
            onClick={onStart}
            className="neo-btn bg-primary hover:bg-primary-light text-white px-10 py-4 text-base font-bold rounded-xl glow-primary mx-auto"
          >
            <Hexagon size={18} />
            Start Simulation
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-8 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Hexagon size={14} className="text-text-faint" />
            <span className="text-[11px] font-mono text-text-faint">VYUHA-MIND STRATEGY SIMULATOR v2.0</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] font-mono text-text-faint">
            <span>MMARP FRAMEWORK</span>
            <span>•</span>
            <span>WORM AUDIT LOGS</span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-success" />
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
