import { useState } from 'react';
import { Cpu, Zap, Users, Swords, LineChart, Target, Rocket, Activity, ChevronRight, Check } from 'lucide-react';
import { parsePRD } from '../../services/simulationApi';

const FEATURES = [
  { id: 'route-opt', name: 'Route Optimization', desc: 'AI-powered delivery routing' },
  { id: 'fuel-analytics', name: 'Fuel Analytics', desc: 'Real-time consumption tracking' },
  { id: 'fleet-track', name: 'Fleet Tracking', desc: 'GPS + IoT fleet monitoring' },
  { id: 'pred-maint', name: 'Predictive Maintenance', desc: 'Failure prediction engine' },
  { id: 'driver-score', name: 'Driver Scoring', desc: 'Performance analytics' },
  { id: 'ev-integration', name: 'EV Integration', desc: 'Electric vehicle support' },
  { id: 'carbon-report', name: 'Carbon Reporting', desc: 'Emissions compliance' },
  { id: 'realtime-alerts', name: 'Real-time Alerts', desc: 'Instant notifications' },
];

const AUDIENCES = [
  { id: 'smb-logistics', name: 'SMB Logistics', desc: '10-50 vehicles' },
  { id: 'enterprise-fleet', name: 'Enterprise Fleet', desc: '500+ vehicles' },
  { id: 'restaurant-chains', name: 'Restaurant Chains', desc: 'F&B delivery' },
  { id: 'urban-delivery', name: 'Urban Delivery', desc: 'Last-mile services' },
];

const AGENTS = [
  { icon: Users, name: 'Consumer Agents', count: 50, desc: 'Simulates diverse Indian personas' },
  { icon: Swords, name: 'Competitor Agents', count: 5, desc: 'Adversarial rivals adjusting prices' },
  { icon: LineChart, name: 'Analyst Agents', count: 3, desc: 'Generates strategic risk reports' }
];

export function SetupPage({ onLaunch }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [marketScenario, setMarketScenario] = useState('');
  const [region, setRegion] = useState('IN');
  const [pricingStrategy, setPricingStrategy] = useState('competitive');
  const [price, setPrice] = useState(1999);
  const [selectedFeatures, setSelectedFeatures] = useState(['route-opt', 'fleet-track']);
  const [target, setTarget] = useState('enterprise-fleet');
  const [adSpend, setAdSpend] = useState(500000);
  const [isDeploying, setIsDeploying] = useState(false);
  const [prdFile, setPrdFile] = useState(null);
  const [prdLoading, setPrdLoading] = useState(false);
  const [prdStatus, setPrdStatus] = useState('');

  const featureByName = FEATURES.reduce((acc, item) => {
    acc[item.name.toLowerCase()] = item.id;
    return acc;
  }, {});

  const targetFromAudience = {
    budget: 'smb-logistics',
    middle_income: 'urban-delivery',
    premium: 'enterprise-fleet',
    enterprise: 'enterprise-fleet',
  };

  const regionNormalize = {
    IN: 'IN',
    INDIA: 'IN',
    US: 'US',
    USA: 'US',
    EU: 'EU',
    EUROPE: 'EU',
    SE_ASIA: 'SE_ASIA',
    MENA: 'MENA',
  };

  const toFeatureIds = (list) => {
    const ids = [];
    (list || []).forEach((raw) => {
      const key = String(raw || '').trim().toLowerCase();
      const exact = featureByName[key];
      if (exact) {
        ids.push(exact);
        return;
      }
      const fuzzy = FEATURES.find((f) => key.includes(f.name.toLowerCase()) || f.name.toLowerCase().includes(key));
      if (fuzzy) ids.push(fuzzy.id);
    });
    const unique = Array.from(new Set(ids));
    return unique.length ? unique : selectedFeatures;
  };

  const handlePRDParse = async () => {
    if (!prdFile) {
      setPrdStatus('Select a PRD file first.');
      return;
    }
    setPrdLoading(true);
    setPrdStatus('Parsing PRD and extracting required fields...');
    try {
      const parsed = await parsePRD(prdFile);
      setName(parsed.product_name || name);
      setDescription(parsed.product_description || description);
      setMarketScenario(parsed.market_scenario || marketScenario);
      setPricingStrategy(parsed.pricing_strategy || pricingStrategy);
      setRegion(regionNormalize[String(parsed.region || '').toUpperCase()] || 'IN');
      if (parsed.price && Number(parsed.price) > 0) {
        setPrice(Number(parsed.price));
      }
      setTarget(targetFromAudience[parsed.target_audience] || target);
      setSelectedFeatures(toFeatureIds(parsed.features));
      const confidence = Math.round((parsed.extraction_confidence || 0.8) * 100);
      const warn = parsed.warnings?.length ? ` Warning: ${parsed.warnings[0]}` : '';
      setPrdStatus(`PRD extracted (${confidence}% confidence).${warn}`);
    } catch (error) {
      setPrdStatus(`Parse failed: ${error.message}`);
    } finally {
      setPrdLoading(false);
    }
  };

  const toggleFeature = (id) => {
    setSelectedFeatures(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleLaunch = () => {
    setIsDeploying(true);
    setTimeout(() => {
      onLaunch({
        name: name || 'Project Alpha',
        description,
        marketScenario,
        region,
        pricingStrategy,
        price,
        features: selectedFeatures,
        target,
        adSpend,
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-base flex flex-col md:flex-row font-sans text-text-main">
      <div className="hidden md:flex w-[400px] xl:w-[500px] border-r border-border p-10 flex-col justify-between bg-surface relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--color-primary)_0%,transparent_60%)] opacity-5" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-text-main flex items-center justify-center rounded-md">
              <Cpu size={20} className="text-base" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-text-main">Vyuha-Mind</h1>
              <p className="font-mono text-[10px] text-text-muted mt-1 tracking-widest uppercase">Agentic Market Simulation</p>
            </div>
          </div>
          
          <h2 className="text-4xl font-light tracking-tight leading-tight mb-6 text-text-main">
            Initialize <br/><span className="font-semibold">Strategy Core</span>
          </h2>
          
          <p className="text-text-muted text-sm leading-relaxed mb-12">
            Configure market parameters. The system will spawn autonomous LLM agents to simulate real-world buyers, competitors, and economic analysts in real-time.
          </p>

          <div className="flex flex-col gap-6 relative">
            <div className="absolute left-3 top-2 bottom-2 w-px bg-border z-0"></div>
            {[
              { num: 1, label: 'Product Envelope' },
              { num: 2, label: 'Market Delivery' },
              { num: 3, label: 'Agent Deployment' }
            ].map(s => (
              <div key={s.num} className="flex items-center gap-4 relative z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono border bg-base ${step >= s.num ? 'border-text-main text-text-main' : 'border-border text-text-muted'}`}>{s.num}</div>
                <span className={`text-sm font-medium ${step >= s.num ? 'text-text-main' : 'text-text-muted'}`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-6 mt-12 relative z-10">
          <div className="font-mono text-[10px] text-text-muted flex justify-between">
            <span>SYS_STATUS: NEUTRAL</span>
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-subtle"></div> CORE ONLINE</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-h-screen overflow-y-auto custom-scroll">
        <div className="max-w-4xl mx-auto p-8 md:p-16 lg:px-24">
          {step === 1 && (
            <div className="animate-data-flow" style={{animationIterationCount: 1, animationDuration: '0.5s'}}>
              <h3 className="text-sm font-mono text-text-muted mb-8 tracking-widest uppercase">01 / Product Definition</h3>
              <div className="space-y-10">
                <div className="neo-panel p-4 bg-surface border border-border">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <label className="block text-xs font-medium text-text-muted uppercase">Upload PRD for Auto-Fill</label>
                    <button
                      onClick={handlePRDParse}
                      disabled={prdLoading || !prdFile}
                      className="neo-btn bg-surface-raised text-text-main disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {prdLoading ? 'Parsing...' : 'Extract'}
                    </button>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.md"
                    onChange={(e) => setPrdFile(e.target.files?.[0] || null)}
                    className="w-full neo-input bg-surface"
                  />
                  {prdStatus ? (
                    <p className="mt-2 text-xs text-text-muted">{prdStatus}</p>
                  ) : null}
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase mb-3">Product Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nexus Fleet Intelligence" className="w-full neo-input text-lg bg-surface" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase mb-3">Product Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the product and core problem it solves"
                    className="w-full neo-input bg-surface min-h-[92px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase mb-3">Market Scenario</label>
                  <textarea
                    value={marketScenario}
                    onChange={(e) => setMarketScenario(e.target.value)}
                    placeholder="Market context extracted from PRD"
                    className="w-full neo-input bg-surface min-h-[92px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-muted uppercase mb-3">Pricing Strategy</label>
                    <select
                      value={pricingStrategy}
                      onChange={(e) => setPricingStrategy(e.target.value)}
                      className="w-full neo-input bg-surface"
                    >
                      <option value="competitive">Competitive</option>
                      <option value="penetration">Penetration</option>
                      <option value="premium">Premium</option>
                      <option value="skimming">Skimming</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted uppercase mb-3">Region</label>
                    <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full neo-input bg-surface">
                      <option value="IN">India</option>
                      <option value="US">United States</option>
                      <option value="EU">Europe</option>
                      <option value="SE_ASIA">South East Asia</option>
                      <option value="MENA">MENA</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="block text-xs font-medium text-text-muted uppercase">Base Price (INR/mo)</label>
                    <span className="text-xl font-mono text-text-main">₹{price.toLocaleString()}</span>
                  </div>
                  <input type="range" min="499" max="14999" step="100" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full" />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <label className="block text-xs font-medium text-text-muted uppercase">Core Features</label>
                    <span className="text-[10px] font-mono text-text-faint">{selectedFeatures.length} / {FEATURES.length} SELECTED</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {FEATURES.map(f => (
                      <div key={f.id} onClick={() => toggleFeature(f.id)} className={`neo-panel neo-interactive p-4 flex flex-col gap-1 border-l-2 ${selectedFeatures.includes(f.id) ? 'border-l-text-main bg-surface-raised' : 'border-l-transparent text-text-muted bg-surface'}`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm font-medium ${selectedFeatures.includes(f.id) ? 'text-text-main' : ''}`}>{f.name}</span>
                          {selectedFeatures.includes(f.id) && <Check size={14} className="text-text-main" />}
                        </div>
                        <span className="text-xs text-text-faint line-clamp-1">{f.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-6 border-t border-border flex justify-end">
                  <button onClick={() => setStep(2)} className="neo-btn bg-surface-raised text-text-main">Next <ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="animate-data-flow" style={{animationIterationCount: 1, animationDuration: '0.5s'}}>
              <h3 className="text-sm font-mono text-text-muted mb-8 tracking-widest uppercase">02 / Market Delivery</h3>
              <div className="space-y-10">
                <div>
                  <label className="block text-xs font-medium text-text-muted uppercase mb-4">Strategic Target Audience</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {AUDIENCES.map(a => (
                      <div key={a.id} onClick={() => setTarget(a.id)} className={`neo-panel neo-interactive p-4 border-l-2 flex flex-col gap-1 ${target === a.id ? 'border-l-success bg-surface-raised text-text-main' : 'border-l-transparent text-text-muted bg-surface'}`}>
                        <span className="text-sm font-medium">{a.name}</span>
                        <span className="text-xs text-text-faint">{a.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-6 border-t border-border flex justify-between">
                  <button onClick={() => setStep(1)} className="text-sm text-text-muted hover:text-text-main px-4 py-2">Back</button>
                  <button onClick={() => setStep(3)} className="neo-btn bg-surface-raised text-text-main">Next <ChevronRight size={16} /></button>
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="animate-data-flow" style={{animationIterationCount: 1, animationDuration: '0.5s'}}>
              <h3 className="text-sm font-mono text-text-muted mb-8 tracking-widest uppercase">03 / Agent Topology</h3>
              <div className="space-y-4 mb-10">
                {AGENTS.map((agent, i) => (
                  <div key={i} className="neo-panel p-5 flex items-center gap-5 bg-surface">
                    <div className="w-12 h-12 rounded bg-surface-raised border border-border flex items-center justify-center shrink-0">
                      <agent.icon size={20} className="text-text-muted" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium flex items-center gap-2 text-text-main">{agent.name} <span className="px-1.5 py-0.5 rounded-sm bg-surface-raised border border-border text-[10px] font-mono text-text-muted">{agent.count} NODES</span></h4>
                      <p className="text-xs text-text-muted mt-1">{agent.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-border flex justify-between items-center">
                <button disabled={isDeploying} onClick={() => setStep(2)} className="text-sm text-text-muted hover:text-text-main px-4 py-2">Back</button>
                <button onClick={handleLaunch} disabled={isDeploying} className="neo-btn bg-text-main text-base relative overflow-hidden group min-w-[180px]">
                  {isDeploying ? <span className="flex items-center gap-2 font-mono text-xs"><Zap size={14} className="animate-pulse-subtle" /> DEPLOYING...</span> : <span className="flex items-center gap-2"><Rocket size={16} /> INITIALIZE</span>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}