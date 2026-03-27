# Product Requirements Document (PRD)
## Aura Fleet Optimizer — LPG Crisis Module

---

### 1. Product Overview

| Field | Value |
|-------|-------|
| **Product Name** | Aura Fleet Optimizer (AFO) |
| **Version** | 1.0.0 |
| **Target Audience** | Enterprise Fleet Operators, SMB Logistics (IN, LK, BD) |
| **Monetization** | ₹1,999/month/vehicle (SaaS Subscription) |

### 2. Strategic Rationale (The LPG Crisis Context)

With the impending restriction on Middle Eastern LPG (March 2026 scenario modeling), auto-rickshaw fleets, delivery vans, and SMB logistics will face an unprecedented 10L/day fuel rationing cap and a 45%+ price surge. Current logistics solutions focus on time-optimization. **Aura Fleet Optimizer** pivots to *fuel-preservation and dynamic rationing strategy*, ensuring fleets can operate efficiently under severe supply constraints.

### 3. Core Features

**F1. Predictive Fuel-Rationing Engine**
- Integrates with vehicle OBD-II to track exact LPG consumption.
- Dynamically limits daily route assignments so no vehicle exceeds the 10L/day rationing cap.

**F2. EV-Transition Readiness Score**
- Analyzes which diesel/LPG routes are prime targets for immediate EV replacement.
- Connects with OEM APIs to show real-time ROI on electric vehicle swapping.

**F3. Crisis-Pricing Matrix**
- Automatically adjusts fleet customer's delivery pricing based on real-time LPG black-market and non-subsidized rates (₹913 benchmark).

### 4. Target Market & Personas

**Persona 1: The "Survival" Fleet Owner (SMB)**
- *Pain Point:* Cannot complete daily deliveries with only 10L of autogas. Faces bankruptcy if drivers sit idle.
- *AFO Solution:* Micro-routing that clusters deliveries to absolutely minimize fuel burn, even if delivery time increases.

**Persona 2: Enterprise Logistics Coordinator**
- *Pain Point:* Needs to rebalance a mixed fleet of LPG and EV vehicles dynamically based on fuel availability in specific city zones.
- *AFO Solution:* EV-Transition Readiness scoring and unified dashboard.

### 5. Competitive Landscape

| Competitor | Current Focus | Disadvantage in LPG Crisis |
|------------|---------------|----------------------------|
| RouteMax   | Speed         | Will burn through 10L cap by 2 PM. |
| LogiTrack  | GPS Tracking  | Doesn't optimize for fuel economy. |
| EcoFleet   | EV only       | Doesn't support legacy LPG vehicles during transition. |

### 6. Simulation Success Metrics (AI04 Target Goals)

When tested in the **AI04 Product Strategy Simulator** under the `lpg_crisis_2026` scenario, the product aims to achieve:
- **Probability of Success (PoS):** Maintain >60% even at peak crisis intensity.
- **Market Share:** Capture 35%+ of the enterprise fleet market as competitors relying on generic routing fail.
- **Investor Confidence:** Trigger "Strong Buy" from Investor agents due to the defensive, crisis-resistant nature of the product.

### 7. Go-To-Market & Pricing Strategy

- **Base Pricing:** ₹1,999/month
- **Crisis Pricing Mechanism:** Upon detection of fuel index spikes, deploy an emergency 20% discount (A2UI Trigger) to capture panicking fleet owners defecting from competitors.
- **Ad Spend:** Focus ₹500,000 monthly budget heavily on B2B logistics forums highlighting "Fuel Rationing Survival."
