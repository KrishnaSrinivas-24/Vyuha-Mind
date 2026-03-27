import { Header } from './Header';
import { KPIPanel } from '../dashboard/KPIPanel';
import { MarketArena } from '../dashboard/MarketArena';
import { AgentLogs } from '../agents/AgentLogs';
import { SentimentHeatmap } from '../dashboard/SentimentHeatmap';
import { CompetitorMatrix } from '../dashboard/CompetitorMatrix';
import { ScenarioInjector } from '../controls/ScenarioInjector';
import { ProductConfig } from '../controls/ProductConfig';
import { PipelineOutputs } from '../agents/PipelineOutputs';
import { useState } from 'react';

export function WarRoom({ onExit, productConfig }) {
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <div id="war-room" className="h-screen flex flex-col bg-bg-primary page-enter overflow-hidden">
      <Header
        onOpenConfig={() => setConfigOpen(true)}
        onExit={onExit}
        productName={productConfig?.name}
      />

      <main className="flex-1 overflow-hidden p-4 flex flex-col gap-4">
        {/* Top: KPI Row */}
        <div className="flex-shrink-0">
          <KPIPanel />
        </div>

        {/* Main: Chart Area + Right Sidebar */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Content Area */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {/* Market Arena Chart */}
            <div className="flex-1 min-h-0">
              <MarketArena />
            </div>
            {/* Bottom Row: Heatmap + Competitors */}
            <div className="h-[250px] flex-shrink-0 flex gap-4">
              <div className="flex-1 min-w-0">
                <SentimentHeatmap />
              </div>
              <div className="w-[300px] flex-shrink-0">
                <CompetitorMatrix />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="w-[350px] flex-shrink-0 flex flex-col gap-4">
            <div className="flex-1 min-h-0">
              <AgentLogs />
            </div>
            <div className="flex-shrink-0">
              <ScenarioInjector />
            </div>
            <div className="h-[280px] flex-shrink-0">
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
