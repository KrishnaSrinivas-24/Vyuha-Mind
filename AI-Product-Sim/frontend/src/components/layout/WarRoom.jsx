import { Header } from './Header';
import { KPIPanel } from '../dashboard/KPIPanel';
import { MarketArena } from '../dashboard/MarketArena';
import { AgentLogs } from '../agents/AgentLogs';
import { SentimentHeatmap } from '../dashboard/SentimentHeatmap';
import { CompetitorMatrix } from '../dashboard/CompetitorMatrix';
import { ScenarioInjector } from '../controls/ScenarioInjector';
import { ProductConfig } from '../controls/ProductConfig';
import { PipelineOutputs } from '../agents/PipelineOutputs';
import { generateCrisisA2UI } from '../a2ui/A2UIRenderer';
import { useSimulation } from '../../context/SimulationContext';
import { useState } from 'react';

export function WarRoom({ onExit, productConfig, onViewReport }) {
  const [configOpen, setConfigOpen] = useState(false);
  const sim = useSimulation();
  const isCrisis = sim?.crisisActive;
  const crisisIntensity = sim?.crisisIntensity || 0;

  const handleA2UIAction = (actionId, props) => {
    if (actionId === 'emergency_discount' && sim?.actions?.updateProduct) {
      const currentPrice = sim?.productConfig?.price || 1999;
      sim.actions.updateProduct({ price: Math.round(currentPrice * 0.8) });
    }
    if (actionId === 'double_marketing' && sim?.actions?.updateProduct) {
      const currentAd = sim?.productConfig?.adSpend || 500000;
      sim.actions.updateProduct({ adSpend: currentAd * 2 });
    }
  };

  return (
    <div
      id="war-room"
      className={`h-screen flex flex-col bg-base page-enter overflow-hidden ${isCrisis ? 'crisis-overlay' : ''}`}
    >
      <Header
        onOpenConfig={() => setConfigOpen(true)}
        onExit={onExit}
        onViewReport={onViewReport}
        productName={productConfig?.name}
      />

      <main className="flex-1 overflow-hidden p-3 flex flex-col gap-2.5">
        {/* Top: KPI Row */}
        <div className="flex-shrink-0">
          <KPIPanel />
        </div>

        {/* A2UI Dynamic Panel — pushed by agents during crisis */}
        {isCrisis && crisisIntensity > 0.3 && (
          <div className="flex-shrink-0 animate-data-flow">
            {generateCrisisA2UI(crisisIntensity, handleA2UIAction)}
          </div>
        )}

        {/* Main: Two-column layout */}
        <div className="flex-1 flex gap-2.5 min-h-0">
          {/* LEFT: Charts + Bottom panels */}
          <div className="flex-1 flex flex-col gap-2.5 min-w-0">
            {/* Market Arena */}
            <div className="flex-1 min-h-0">
              <MarketArena />
            </div>
            {/* Bottom Row: Heatmap + Competitors */}
            <div className="h-[200px] flex-shrink-0 flex gap-2.5">
              <div className="flex-1 min-w-0">
                <SentimentHeatmap />
              </div>
              <div className="w-[260px] flex-shrink-0">
                <CompetitorMatrix />
              </div>
            </div>
          </div>

          {/* RIGHT: Agent Activity (big) + Scenario + Pipeline */}
          <aside className="w-[340px] flex-shrink-0 flex flex-col gap-2.5">
            {/* Agent Activity — LARGE, takes most of the sidebar */}
            <div className="flex-[3] min-h-0">
              <AgentLogs />
            </div>
            {/* Scenario Injector — compact */}
            <div className="flex-shrink-0">
              <ScenarioInjector />
            </div>
            {/* Pipeline Outputs — scrollable */}
            <div className="flex-[1] min-h-[120px]">
              <PipelineOutputs />
            </div>
          </aside>
        </div>
      </main>

      {/* Product Config Drawer */}
      <ProductConfig isOpen={configOpen} onClose={() => setConfigOpen(false)} />
    </div>
  );
}
