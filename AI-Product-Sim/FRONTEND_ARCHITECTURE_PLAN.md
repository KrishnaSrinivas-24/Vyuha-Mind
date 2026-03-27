# Autonomous Product Strategy Simulator [AI04]: Digital War Room UI Architecture Blueprint

## 1. Design Philosophy & Visual Language

### The Command Center Aesthetic
The UI revolves around a "high-stakes operational cockpit" theme using a modern Dark Mode & Glassmorphism foundation to ensure critical data pops.
-   **Color Palette:**
    -   **Background:** Deep Obsidian (`#09090b`) to Dark Zinc (`#18181b`) gradient.
    -   **Glass Panels:** `rgba(255, 255, 255, 0.05)` combined with `backdrop-filter: blur(16px)` and subtle `1px` borders.
    -   **Traffic Light Alerts:**
        -   🟢 Stable (Green): `#10b981` (High adopting, stable logistics)
        -   🟡 Warning (Yellow): `#f59e0b` (Competitor friction, minor supply chain delays)
        -   🔴 Severe Risk (Red): `#ef4444` (Catastrophic shocks, LPG crisis active)
    -   **Typography:** Monospaced data tags intertwined with bold Sans-Serif headers (e.g., Inter, JetBrains Mono for metrics) to emphasize precision.

### Information Hierarchy (F-Pattern Integration)
-   **Top-Left (Highest Priority):** Executive HUD featuring the **Probability of Success (PoS)** gauge and primary Traffic Light Status.
-   **Center-Right:** The High-Performance Main Stage (Canvas-based ECharts visualization).
-   **Bottom-Left:** Contextual Sentiment Heatmaps for deep-dive customer insights.
-   **Right Rail:** The Agent-to-User Interface (A2UI) Agent logs, injecting interactive components based on live simulation data.

---

## 2. Core Dashboard Components Implementation Plan

### 📊 Component 1: Executive HUD (KPI Panel)
*File mapping: `frontend/src/components/dashboard/KPIPanel.jsx`, `ProbabilityGauge.jsx`*
-   **Implementation:** Build a primary "Speedometer" style gauge component mapped to the aggregate PoS score via ECharts.
-   **Logic:** Derive PoS from the formula `(W_mp * S_mp) + (W_pmf * S_pmf) + (W_ms * S_ms) + (W_ea * S_ea)`.
-   **Visuals:** Glowing rings with conditional classes (`bg-success`, `bg-danger`) based on state transitions. Ticking numbers using `framer-motion` for fluid odometer-style scroll transitions.

### 📈 Component 2: High-Performance Main Stage (Market Arena)
*File mapping: `frontend/src/components/dashboard/MarketArena.jsx`*
-   **Implementation:** Refactor from SVG-based `recharts` to Canvas-based `echarts-for-react`.
-   **Logic:** Render intersecting supply/demand curves derived from MMARP (Massively Multi-Agents Role-Playing) simulation ticks.
-   **Visuals:**
    -   Tens of thousands of data points smoothed using `spline` type.
    -   Critical feature: Smooth `tweening` of paths when a crisis happens (e.g., curves don't snap; they organically flatten or plunge when the March 2026 LPG Crisis is injected).

### 🔥 Component 3: Agentic Heatmaps
*File mapping: `frontend/src/components/dashboard/SentimentHeatmap.jsx`*
-   **Implementation:** Build a dynamic `div` grid mapped to X=Pricing Tier, Y=Consumer Persona (e.g., "Coastal Restaurant Owner", "Enterprise Logistics").
-   **Visuals:** Deep blues for churn (cool color logic) transitioning to bright oranges/reds for high engagement (warm color logic).
-   **Animation:** Use CSS grid transitions to let judges watch "cool waves" of churn wash across the board during the crisis.

### 🤖 Component 4: Agent-to-User Interface (A2UI) Innovation
*File mapping: `frontend/src/components/agents/AgentLogs.jsx`, `frontend/src/components/agents/InteractiveCrisisMap.jsx`*
-   **Implementation:** Instead of rendering simple text blocks (e.g., `<li>Agent: Supply failed</li>`), the log stream parses structured JSON payloads (`{type: "UI_COMPONENT", component: "CrisisMap", ...}`).
-   **Visuals:** When the LPG crisis strikes, an interactive `CrisisMap` drops into the sidebar. It features a draggable slider to let the user directly dynamically adjust "Emergency Fuel Budget" or lower prices.

---

## 3. Hackathon Demo Workflow (Execution Steps)

The demo will follow a 5-step narrative to maximize "Wow Factor." This dictates how our React State Machine operates:

1.  **The Setup:** Standard inputs -> App state initializes.
2.  **The Calm:** Simulation `status = RUNNING`. Polling interval updates data. PoS stabilizes ~85%.
3.  **The Climax (Shock):** Click "Inject Crisis". `crisisActive` boolean flips. ECharts trigger `setOption` with catastrophic datasets. A2UI drops the `<InteractiveCrisisMap />` onto the screen. Red alarms pulse.
4.  **The Pivot:** User interacts with the dynamic component in A2UI (e.g., adjusting price constraints to enterprise clients).
5.  **The Resolution:** The supervisor orchestrator recalculates, the PoS gauge stablizes smoothly, and a success payload is rendered gracefully.

## Next Steps for AI Implementation (TODOS)
- [ ] Task 1: Re-architect global state provider for the Demo Workflow State Machine.
- [ ] Task 2: Build the High-Performance Market Arena using ECharts.
- [ ] Task 3: Develop the Agentic Heatmap Grid.
- [ ] Task 4: Construct the Executive HUD with the Probability of Success Gauge.
- [ ] Task 5: Implement the A2UI Engine handling dynamic interactive UI injection in the Agent Log.
- [ ] Task 6: Hook up the Crisis Demo sequence with violent, cinematic CSS transitions and Framer Motion.
