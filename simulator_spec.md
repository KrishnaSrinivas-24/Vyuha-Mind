# Autonomous Multi-Agent Product Strategy Simulator
## Complete Engineering Specification

---

## SYSTEM OVERVIEW

```
User Input
    ↓
Input Handler  (validate, normalize, embed, build config)
    ↓
Orchestrator   (controls everything — the backbone)
    ↓
Market Analysis Agent  [GROK]  (sets the world)
    ↓
Simulation Loop (5 steps):
    Customer Agent     [Claude]
    Competitor Agent   [Claude]
    Investor Agent     [Claude]
    ↓
Evaluation Engine     (score + categorize)
    ↓
Recommendation Engine (test variations, pick best)
    ↓
Output → Frontend Dashboard
```

**AI Model Split:**
| Agent | Model | Reason |
|---|---|---|
| Market Analysis Agent | Grok | Real-time geopolitical + X/Twitter data |
| Customer Agent | Claude | Behavioral reasoning + persona logic |
| Competitor Agent | Claude | Strategic competitive thinking |
| Investor Agent | Claude | Risk/return financial evaluation |
| Recommendation Engine | Claude | Synthesis + strategic advice |

---

---

## 1. INPUT HANDLER

### Purpose
Convert raw, unstructured user input into a clean, normalized, machine-ready config object that every downstream component can use without ambiguity.

---

### Inputs (What it receives from user)
```json
{
  "product_name": "Electric Cooker",
  "product_description": "Induction-based electric cooker for home use",
  "features": ["fast heating", "low power consumption", "auto shutoff"],
  "price": 3000,
  "pricing_strategy": "penetration",
  "target_audience": "middle-class households",
  "market_scenario": "Iran-US war causing LPG shortage in India",
  "region": "India"
}
```

---

### Steps Taken (in order)

**Step 1 — Field Validation**
- Check all required fields are present
- Check data types (price must be numeric, features must be a list)
- Check value ranges (price > 0, region is a known string)
- If anything is missing or invalid → raise structured error immediately, do not proceed

**Step 2 — Text Normalization**
- Lowercase all text fields
- Strip extra whitespace
- Standardize region names ("india" → "IN", "us" → "US")
- Standardize audience types to known categories: `["budget", "middle_income", "premium", "enterprise"]`

**Step 3 — Price Normalization (0–1 scale)**
- Internal price index = raw_price / 10000
- This is used in formulas, NOT displayed to user
- Keep original raw_price for display

**Step 4 — Embedding Generation**
- Send `market_scenario` text through embedding model (OpenAI `text-embedding-3-small` or similar)
- Store embedding vector for semantic scenario matching
- Match against known scenario library:
  - "energy_crisis", "supply_chain_disruption", "economic_growth", "recession", "trade_war", "stable_market"
- Output: `scenario_tag` (closest match) + `confidence_score` (0–1)

**Step 5 — Keyword Fallback**
- If embedding confidence < 0.65, fall back to keyword detection:
  ```
  "war" | "conflict" | "tension"  → "geopolitical_crisis"
  "shortage" | "supply" | "disruption" → "supply_chain_disruption"
  "inflation" | "prices rising" → "economic_pressure"
  "growth" | "boom" | "demand rising" → "economic_growth"
  default → "stable_market"
  ```

**Step 6 — Build Config Object**
- Combine all normalized values into final config

---

### Output (What it returns)
```json
{
  "product": {
    "name": "electric cooker",
    "description": "induction-based electric cooker for home use",
    "features": ["fast heating", "low power consumption", "auto shutoff"],
    "raw_price": 3000,
    "price_index": 0.3,
    "pricing_strategy": "penetration",
    "feature_score": 0.75
  },
  "audience": {
    "type": "middle_income",
    "raw_description": "middle-class households",
    "price_sensitivity": 0.75
  },
  "market": {
    "raw_scenario": "Iran-US war causing LPG shortage in India",
    "scenario_tag": "energy_crisis",
    "scenario_confidence": 0.88,
    "region": "IN"
  }
}
```

---

### Decisions Taken
| Decision | Logic |
|---|---|
| Which scenario tag to assign | Embedding similarity > 0.65 → use embedding match; else → keyword fallback |
| Price sensitivity for audience | budget=0.9, middle_income=0.75, premium=0.4, enterprise=0.3 |
| Feature score | len(features) / 10, capped at 1.0 |
| Fail or warn | Missing required fields → hard fail; missing optional fields → use defaults + warn |

---

### Error Handling
```
MISSING_FIELD      → { error: "missing_field", field: "price", message: "Price is required" }
INVALID_PRICE      → { error: "invalid_value", field: "price", message: "Price must be > 0" }
UNKNOWN_REGION     → warn + default to "GLOBAL"
EMBEDDING_FAILURE  → fall back to keyword matching silently
```
**Rule: Never crash the pipeline. Every error either hard-fails with clear message or soft-falls to a safe default.**

---

### State Tracking
Input Handler does NOT modify simulation state. It only produces the config object. No history stored here.

---

### Context Adjustment
- `region = "IN"` → boosts price_sensitivity by +0.05 (India is price-sensitive market)
- `pricing_strategy = "penetration"` → sets initial price_index 10% lower than raw
- `pricing_strategy = "premium"` → raises feature_score weight by 0.1

---

---

## 2. ORCHESTRATOR

### Purpose
The central controller. It owns the simulation lifecycle — initializes the world, coordinates all agents, runs the loop, collects history, and hands off to evaluation and recommendation. Nothing runs without the orchestrator's permission.

---

### Inputs (What it receives)
- Config object from Input Handler
- Simulation parameters (num_steps, price_variants for recommendation)

---

### Steps Taken (in order)

**Step 1 — Initialize State**
- Build the starting simulation world from config
- Set all variables to baseline values

**Step 2 — Call Market Analysis Agent (Grok)**
- Pass: `market_scenario`, `product_name`, `region`
- Receive: structured market variables
- Inject market variables into state
- Store `market_summary` and `key_events` for display

**Step 3 — Run Simulation Loop**
- For `num_steps` iterations (default: 5):
  - Call Customer Agent → update state
  - Call Competitor Agent → update state
  - Call Investor Agent → update state
  - Append current state snapshot to `history[]`
  - Append agent reasoning to `agent_logs[]`
  - Check convergence (if demand delta < 0.01 for 2 steps → stop early)

**Step 4 — Collect Final Results**
- Extract final state values
- Package history and logs

**Step 5 — Call Evaluation Engine**
- Pass final state → receive score + status

**Step 6 — Call Recommendation Engine**
- Pass config + current score → receive best strategy

**Step 7 — Build Final Output Object**
- Combine everything into response payload

---

### Output (What it returns)
```json
{
  "simulation_id": "uuid",
  "steps_run": 5,
  "history": [ {state_step_0}, {state_step_1}, ... ],
  "agent_logs": [
    {
      "step": 0,
      "customer": { "reasoning": "...", "sentiment": "positive" },
      "competitor": { "strategy": "...", "action": "price_cut" },
      "investor": { "verdict": "...", "risk_flag": false }
    }
  ],
  "market_context": {
    "summary": "Iran-US war has caused LPG prices to spike...",
    "key_events": ["LPG shortage in India", "Electric appliance demand up 40%"]
  },
  "evaluation": { "score": 74, "status": "High Potential" },
  "recommendation": { "best_price": 2700, "expected_score": 82, "advice": "..." },
  "final_state": { ... }
}
```

---

### Decisions Taken
| Decision | Logic |
|---|---|
| How many steps to run | Default 5; stop early if convergence detected |
| Convergence check | If abs(demand[t] - demand[t-1]) < 0.01 for 2 consecutive steps |
| Whether to re-run for recommendation | Always run 3 price variants unless time constraint |
| Agent call order | Market → Customer → Competitor → Investor (strict, always) |

---

### Error Handling
```
MARKET_AGENT_FAIL    → use fallback market defaults, log warning, continue
AGENT_TIMEOUT        → skip that agent's update for that step, use previous state
LLM_PARSE_FAIL       → use last valid state, increment error counter
LOOP_EXCEPTION       → catch, store partial history, attempt evaluation on what exists
```
**Rule: Never let a single agent failure kill the whole simulation.**

---

### State Tracking
Orchestrator owns the master history list:
```python
history = []  # list of state snapshots, one per step
agent_logs = []  # list of agent reasoning, one per step

# After each step:
history.append(state.copy())
agent_logs.append({ "step": step, "customer": ..., "competitor": ..., "investor": ... })
```

---

### Multi-Strategy Testing
```python
# Orchestrator runs 3 variants for recommendation
price_variants = [
    config["product"]["raw_price"] * 0.8,   # -20%
    config["product"]["raw_price"] * 0.9,   # -10%
    config["product"]["raw_price"],          # original
    config["product"]["raw_price"] * 1.1    # +10%
]

variant_results = []
for price in price_variants:
    config_copy = deep_copy(config)
    config_copy["product"]["raw_price"] = price
    result = run_single_simulation(config_copy)
    variant_results.append({ "price": price, "score": result["score"] })
```

---

---

## 3. MARKET ANALYSIS AGENT

### Purpose
Convert real-world geopolitical and economic context into structured numerical variables that ground the simulation in reality. This is the only agent that calls **Grok** — because Grok has live access to X/Twitter sentiment and current news.

---

### Inputs (What it receives)
```json
{
  "scenario_text": "Iran-US war causing LPG shortage in India",
  "product_name": "electric cooker",
  "product_type": "appliance",
  "region": "IN",
  "scenario_tag": "energy_crisis"
}
```

---

### Steps Taken (in order)

**Step 1 — Scenario Understanding (Grok call)**
- Send scenario_text to Grok with system prompt:
  > "You are a real-time market intelligence agent. You have access to current news and X/Twitter sentiment. Analyze the given scenario based on what is ACTUALLY happening right now in the world."
- Ask Grok to return structured JSON (see output format below)

**Step 2 — Scenario Classification**
- Map Grok's analysis into one of known scenario types
- Validate all returned values are in 0–1 range

**Step 3 — Variable Mapping**
- Convert scenario classification into simulation variables
- Each variable gets a base value from Grok + adjustments from Step 4

**Step 4 — Context Adjustment**
- Adjust variables based on product type and region:
  ```
  if product = "electric cooker" AND scenario = "energy_crisis":
      demand_shift += 0.15  (product directly benefits from crisis)
  
  if region = "IN":
      price_sensitivity += 0.1  (India is highly price-sensitive)
  
  if scenario = "geopolitical_crisis":
      volatility += 0.2
  ```

**Step 5 — Output Structured Market State**
- All values clamped to 0.0–1.0
- Include human-readable summary and key events list for frontend display

---

### Grok Prompt Template
```
System: You are a real-time market intelligence agent with access to current events.

User: 
Scenario: {scenario_text}
Product: {product_name}
Region: {region}

Based on REAL current events happening right now, return ONLY this JSON (no markdown, no explanation):
{
  "fuel_price_index": <0.0-1.0, how expensive is fuel/energy right now>,
  "supply_disruption": <0.0-1.0, how disrupted is supply chain>,
  "demand_shift": <0.0-1.0, how much demand is shifting toward this product type>,
  "market_volatility": <0.0-1.0, how unstable is the market>,
  "price_sensitivity": <0.0-1.0, how price-sensitive are consumers right now>,
  "market_pressure": <0.0-1.0, overall external pressure on businesses>,
  "consumer_stress": <0.0-1.0, financial stress level of target consumers>,
  "summary": "<2 sentences describing current real-world conditions>",
  "key_events": ["<event1>", "<event2>", "<event3>"]
}
```

---

### Output (What it returns to Orchestrator)
```json
{
  "fuel_price_index": 0.88,
  "supply_disruption": 0.75,
  "demand_shift": 0.85,
  "market_volatility": 0.80,
  "price_sensitivity": 0.82,
  "market_pressure": 0.78,
  "consumer_stress": 0.70,
  "summary": "Iran-US tensions have caused a significant LPG supply shock in South Asia. Indian consumers are actively seeking electric alternatives as cylinder prices spike.",
  "key_events": [
    "LPG prices up 35% in India this month",
    "Electric induction cooker sales up 40% in Andhra Pradesh",
    "Government fast-tracking electric cooking subsidy scheme"
  ]
}
```

---

### Decisions Taken
| Decision | Logic |
|---|---|
| Which real events to surface | Grok selects based on recency + relevance to product+region |
| Demand shift direction | Positive if scenario creates demand for product, negative if it hurts |
| Context adjustment magnitude | Product-scenario alignment score determines boost magnitude |
| Fallback if Grok fails | Use scenario_tag → hardcoded safe defaults table |

---

### Error Handling
```
GROK_API_FAIL      → use scenario_tag + hardcoded defaults table
JSON_PARSE_FAIL    → retry once with stricter prompt; if fails again → use defaults
OUT_OF_RANGE_VALUE → clamp to [0.0, 1.0]
MISSING_FIELD      → fill with 0.5 (neutral)
```

**Fallback Defaults Table:**
```python
SCENARIO_DEFAULTS = {
  "energy_crisis":           { "fuel_price_index": 0.9, "supply_disruption": 0.7, "demand_shift": 0.8, "market_volatility": 0.8, "price_sensitivity": 0.8, "market_pressure": 0.75, "consumer_stress": 0.7 },
  "stable_market":           { "fuel_price_index": 0.5, "supply_disruption": 0.2, "demand_shift": 0.5, "market_volatility": 0.3, "price_sensitivity": 0.5, "market_pressure": 0.4, "consumer_stress": 0.3 },
  "economic_growth":         { "fuel_price_index": 0.5, "supply_disruption": 0.1, "demand_shift": 0.6, "market_volatility": 0.2, "price_sensitivity": 0.4, "market_pressure": 0.3, "consumer_stress": 0.2 },
  "recession":               { "fuel_price_index": 0.6, "supply_disruption": 0.5, "demand_shift": 0.3, "market_volatility": 0.7, "price_sensitivity": 0.9, "market_pressure": 0.8, "consumer_stress": 0.85 },
  "geopolitical_crisis":     { "fuel_price_index": 0.85, "supply_disruption": 0.8, "demand_shift": 0.6, "market_volatility": 0.9, "price_sensitivity": 0.75, "market_pressure": 0.85, "consumer_stress": 0.7 },
  "supply_chain_disruption": { "fuel_price_index": 0.6, "supply_disruption": 0.9, "demand_shift": 0.5, "market_volatility": 0.7, "price_sensitivity": 0.7, "market_pressure": 0.7, "consumer_stress": 0.6 }
}
```

---

### State Injection
Market Agent output gets merged directly into simulation state:
```python
state.update(market_agent_output)
# After this, state now contains all market variables + original state vars
```

---

### Context Adjustment Rules (Full List)
```
PRODUCT ADJUSTMENTS:
  electric_cooker + energy_crisis     → demand_shift += 0.15
  ev + energy_crisis                  → demand_shift += 0.20
  lpg_stove + energy_crisis           → demand_shift -= 0.30
  luxury_item + recession             → demand_shift -= 0.25
  budget_item + recession             → demand_shift += 0.10

REGION ADJUSTMENTS:
  IN (India)     → price_sensitivity += 0.10, consumer_stress += 0.05
  US             → price_sensitivity -= 0.05
  EU             → market_volatility += 0.05 (energy crisis hits harder)
  
PRICING STRATEGY ADJUSTMENTS:
  penetration    → price_sensitivity impact multiplied by 1.2
  premium        → price_sensitivity impact multiplied by 0.7
```

---

---

## 4. CUSTOMER AGENT

### Purpose
Simulate how the target customer segment reacts to the product under current market conditions. This drives `demand` — which everything else reacts to.

---

### Inputs (What it receives — from state)
```json
{
  "raw_price": 3000,
  "price_index": 0.30,
  "price_sensitivity": 0.82,
  "demand_shift": 0.85,
  "competition": 0.35,
  "feature_score": 0.75,
  "consumer_stress": 0.70,
  "market_volatility": 0.80,
  "current_demand": 0.50
}
```

---

### Steps Taken (in order)

**Step 1 — Evaluate Value vs Price**
- Is the price acceptable given consumer stress level?
- `price_pressure = price_index * price_sensitivity`
- High price + high sensitivity = lower demand

**Step 2 — React to Market Conditions**
- Does this scenario HELP or HURT demand for this product?
- `market_boost = demand_shift * (1 - consumer_stress * 0.3)`
- Energy crisis with electric cooker = strong positive boost

**Step 3 — Consider Competition**
- More competitors = more options = demand splits
- `competition_drag = competition * 0.25`

**Step 4 — Consider Product Quality**
- More features = higher perceived value
- `quality_boost = feature_score * 0.2`

**Step 5 — Calculate New Demand**
```python
demand = (
    0.5                    # base
    + market_boost         # scenario benefit
    + quality_boost        # product quality
    - price_pressure       # price barrier
    - competition_drag     # competition effect
)
demand = clamp(demand, 0.0, 1.0)
```

**Step 6 — Claude LLM Call**
- Send all values + persona to Claude
- Claude returns: demand_adjustment (delta), sentiment, reasoning string
- Apply Claude's delta on top of formula result (weighted 60% formula, 40% Claude)

---

### Claude Prompt Template
```
System: You are a {audience_type} consumer in {region}. You make rational but emotionally influenced buying decisions.

User:
Product: {product_name} at ₹{raw_price}
Features: {features}
Market situation: {market_summary}
Key events: {key_events}
Current economic stress level: {consumer_stress}/1.0
Competition available: {competition}/1.0

As this consumer, react to this product. Return ONLY JSON:
{
  "demand_adjustment": <-0.3 to +0.3, your pull/push on demand>,
  "sentiment": "very_positive|positive|neutral|negative|very_negative",
  "price_verdict": "too_expensive|fair|good_value|excellent_value",
  "reasoning": "<1-2 sentences as the customer explaining your reaction>"
}
```

---

### Output (What it returns)
```json
{
  "demand": 0.78,
  "sentiment": "positive",
  "price_verdict": "good_value",
  "reasoning": "With LPG prices skyrocketing and cylinders unavailable, switching to an electric cooker at ₹3000 is actually affordable compared to my monthly gas expenses now."
}
```

Updates to state: `state["demand"] = demand`

---

### Decisions Taken
| Decision | Logic |
|---|---|
| Is price acceptable? | If price_index > 0.5 AND price_sensitivity > 0.7 → demand drops |
| Does scenario help? | demand_shift > 0.6 → strong market pull toward product |
| How much does competition matter? | competition > 0.7 → significant demand split |
| Final blend | 60% formula + 40% Claude LLM delta |

---

### Error Handling
```
CLAUDE_FAIL     → use formula-only result (100% formula)
INVALID_DELTA   → clamp delta to [-0.3, +0.3]
DEMAND_OOB      → clamp to [0.0, 1.0]
```

---

### State Tracking
```python
# Customer agent appends to state history context
state["customer_history"].append({
  "step": current_step,
  "demand": new_demand,
  "sentiment": sentiment,
  "reasoning": reasoning
})
```

---

### Multiple Scenario Simulation
When Recommendation Engine tests price variants, Customer Agent is called fresh per variant with updated `price_index`. Sentiment and reasoning update accordingly.

---

---

## 5. COMPETITOR AGENT

### Purpose
Simulate how competitors in the market react to the product's presence and growing demand. Introduces pressure, realism, and strategic tension.

---

### Inputs (What it receives — from state)
```json
{
  "demand": 0.78,
  "raw_price": 3000,
  "price_index": 0.30,
  "competition": 0.35,
  "market_volatility": 0.80,
  "supply_disruption": 0.75,
  "step": 2
}
```

---

### Steps Taken (in order)

**Step 1 — Detect Threat Level**
- How dangerous is this product to existing competitors?
- `threat = demand * 0.6 + market_volatility * 0.4`
- High demand in volatile market = high threat

**Step 2 — Choose Strategy**
```
threat > 0.75  → "aggressive"   (price war + heavy marketing)
threat > 0.50  → "reactive"     (moderate price cut + feature copy)
threat > 0.30  → "monitoring"   (watch and wait)
threat <= 0.30 → "ignore"       (no significant response)
```

**Step 3 — React Based on Strategy**
```
aggressive:   competition += 0.30, price -= 15% (competitor cuts price)
reactive:     competition += 0.20, price -= 8%
monitoring:   competition += 0.08
ignore:       competition += 0.02
```

**Step 4 — Apply Supply Constraint**
- If supply_disruption is high, competitor ALSO struggles → soften response
- `if supply_disruption > 0.6: competition_increase *= 0.7`

**Step 5 — Claude LLM Call**
- Claude reasons as a competitor CEO/strategist
- Returns: action_type, price_adjustment, reasoning

---

### Claude Prompt Template
```
System: You are the strategic director of a competing company in the {product_type} market in {region}. You are aggressive, data-driven, and react to market signals.

User:
Competitor product: {product_name} at ₹{raw_price}
Their current demand level: {demand}/1.0
Market situation: {market_summary}
Your current market share pressure: {competition}/1.0
Supply disruption level: {supply_disruption}/1.0

Decide your competitive response. Return ONLY JSON:
{
  "strategy": "aggressive|reactive|monitoring|ignore",
  "price_adjustment": <negative int, price cut you'd make in rupees>,
  "competition_delta": <0.0 to 0.35, how much you increase market pressure>,
  "action": "<specific action: price_cut|feature_launch|marketing_push|none>",
  "reasoning": "<1-2 sentences as the competitor explaining your move>"
}
```

---

### Output (What it returns)
```json
{
  "strategy": "reactive",
  "competition": 0.55,
  "raw_price": 2760,
  "price_index": 0.276,
  "competitor_action": "price_cut",
  "competitor_reasoning": "Their demand is surging due to the LPG crisis. We're cutting our induction stove price by ₹240 and pushing delivery promotions to retain market share."
}
```

Updates to state: `state["competition"]`, `state["raw_price"]`, `state["price_index"]`

---

### Decisions Taken
| Decision | Logic |
|---|---|
| Threat level | demand × 0.6 + volatility × 0.4 |
| Strategy choice | Threshold-based on threat level |
| Price cut magnitude | aggressive=15%, reactive=8%, monitoring=0%, ignore=0% |
| Supply constraint softening | if supply_disruption > 0.6 → reduce response by 30% |
| Price floor | Never below 40% of original price (unrealistic otherwise) |

---

### Error Handling
```
CLAUDE_FAIL         → use formula-only strategy selection
PRICE_BELOW_FLOOR   → set to price_floor = raw_price * 0.6
COMPETITION > 1.0   → clamp to 1.0
NEGATIVE_DELTA      → ignore (competitors don't reduce competition)
```

---

### State Tracking
```python
state["competitor_history"].append({
  "step": current_step,
  "strategy": strategy,
  "action": action,
  "competition": new_competition,
  "price": new_price,
  "reasoning": reasoning
})
```

---

### Context Adjustment
```
If step == 1:  competitor response is muted (they haven't reacted yet)
If step >= 3:  competitor gets smarter (adds 0.05 bonus to competition_delta)
If supply_disruption > 0.7: competitor also constrained, reduce aggression by 30%
```

---

---

## 6. INVESTOR AGENT

### Purpose
Evaluate whether the product strategy is financially and strategically viable. Acts as the final judge each round — provides confidence score and risk assessment.

---

### Inputs (What it receives — from state)
```json
{
  "demand": 0.78,
  "competition": 0.55,
  "raw_price": 2760,
  "price_index": 0.276,
  "market_volatility": 0.80,
  "consumer_stress": 0.70,
  "confidence": 0.50,
  "risk": 0.30,
  "step": 2
}
```

---

### Steps Taken (in order)

**Step 1 — Evaluate Growth Potential**
- Is demand strong enough to justify investment?
- `growth_signal = demand * 0.6 + (1 - competition) * 0.4`

**Step 2 — Evaluate Risk**
- How likely is this to fail?
- `risk = competition * 0.4 + market_volatility * 0.35 + consumer_stress * 0.25`

**Step 3 — Evaluate Profit Potential**
- Is the price high enough to be profitable?
- `profit_signal = price_index * (1 - price_sensitivity * 0.4)`

**Step 4 — Calculate Confidence**
```python
confidence = (
    0.45 * growth_signal +
    0.35 * profit_signal -
    0.20 * risk
)
confidence = clamp(confidence, 0.0, 1.0)
```

**Step 5 — Claude LLM Call**
- Claude reasons as a pragmatic startup investor
- Adds nuanced risk flags (e.g., "competition intensifying rapidly in step 3")

---

### Claude Prompt Template
```
System: You are a pragmatic early-stage investor evaluating a product strategy. You care about TAM, competitive moat, unit economics, and market timing. You are neither optimistic nor pessimistic — just honest.

User:
Product: {product_name} at ₹{raw_price}
Current demand level: {demand}/1.0
Competition intensity: {competition}/1.0
Market volatility: {market_volatility}/1.0
Consumer financial stress: {consumer_stress}/1.0
Simulation step: {step}/5
Market context: {market_summary}

Evaluate this product's investment viability. Return ONLY JSON:
{
  "confidence_adjustment": <-0.2 to +0.2, your adjustment to confidence>,
  "risk_adjustment": <-0.1 to +0.2, your adjustment to risk>,
  "verdict": "strong_buy|buy|hold|sell|avoid",
  "risk_flags": ["<flag1>", "<flag2>"],
  "reasoning": "<2 sentences as the investor explaining your position>"
}
```

---

### Output (What it returns)
```json
{
  "confidence": 0.72,
  "risk": 0.38,
  "verdict": "buy",
  "risk_flags": ["Competition escalating rapidly", "Price war may compress margins"],
  "reasoning": "The demand surge from the energy crisis creates a real market window. However, competition is intensifying — the window may be 3-6 months before the market saturates."
}
```

Updates to state: `state["confidence"]`, `state["risk"]`

---

### Decisions Taken
| Decision | Logic |
|---|---|
| Growth signal | demand × 0.6 + (1-competition) × 0.4 |
| Risk calculation | competition × 0.4 + volatility × 0.35 + consumer_stress × 0.25 |
| Verdict threshold | confidence > 0.7 = buy, 0.5–0.7 = hold, < 0.5 = avoid |
| When to flag risk | competition > 0.65 OR risk > 0.6 → always flag |

---

### Error Handling
```
CLAUDE_FAIL          → use formula-only confidence + risk
CONFIDENCE_OOB       → clamp to [0.0, 1.0]
RISK_OOB             → clamp to [0.0, 1.0]
CONTRADICTORY_OUTPUT → if verdict="buy" but confidence < 0.4 → override verdict to "hold"
```

---

### State Tracking
```python
state["investor_history"].append({
  "step": current_step,
  "confidence": new_confidence,
  "risk": new_risk,
  "verdict": verdict,
  "risk_flags": risk_flags,
  "reasoning": reasoning
})
```

---

---

## 7. EVALUATION ENGINE

### Purpose
Convert the final simulation state into clear, interpretable metrics. No LLM calls here — pure deterministic scoring. This is what the dashboard's big score number comes from.

---

### Inputs (What it receives)
```json
{
  "demand": 0.78,
  "competition": 0.55,
  "confidence": 0.72,
  "risk": 0.38,
  "market_volatility": 0.80,
  "steps_run": 5
}
```

---

### Steps Taken (in order)

**Step 1 — Calculate Raw Success Score**
```python
success_raw = (
    0.40 * demand +
    0.30 * confidence -
    0.20 * competition -
    0.10 * risk
)
```

**Step 2 — Apply Volatility Penalty**
```python
# High volatility = less certain outcome = slight penalty
volatility_penalty = market_volatility * 0.05
success_raw -= volatility_penalty
```

**Step 3 — Normalize to 0–100**
```python
success_score = round(clamp(success_raw, 0.0, 1.0) * 100)
```

**Step 4 — Categorize**
```
85–100  → "🚀 High Potential"
65–84   → "✅ Moderate Potential"
45–64   → "⚠️ Risky"
0–44    → "❌ Not Recommended"
```

**Step 5 — Generate Metric Breakdown**
- Demand Health: demand mapped to "Strong / Moderate / Weak"
- Competition Pressure: competition mapped to "Low / Medium / High / Extreme"
- Investor Confidence: confidence mapped to "Strong / Moderate / Low"
- Market Risk: risk mapped to "Low / Moderate / High"

**Step 6 — Trend Detection**
- Compare demand[step_1] vs demand[step_5] → "Growing / Stable / Declining"
- Compare competition[step_1] vs competition[step_5] → "Intensifying / Stable / Easing"

---

### Output (What it returns)
```json
{
  "success_score": 74,
  "status": "✅ Moderate Potential",
  "breakdown": {
    "demand_health": "Strong",
    "competition_pressure": "Medium",
    "investor_confidence": "Strong",
    "market_risk": "Moderate"
  },
  "trends": {
    "demand_trend": "Growing",
    "competition_trend": "Intensifying"
  },
  "summary": "Strong consumer demand driven by energy crisis creates real opportunity, but intensifying competition over time will compress margins."
}
```

---

### Decisions Taken
| Decision | Logic |
|---|---|
| Score weights | Demand 40% most important (market pull), confidence 30% (viability), competition 20% negative, risk 10% negative |
| Volatility penalty | 5% max penalty — markets always have some volatility |
| Status thresholds | Tuned so a "normal healthy product" scores 65-75 |

---

### Error Handling
```
MISSING_STATE_KEY   → use 0.5 neutral default for that key, log warning
SCORE_OUT_OF_RANGE  → clamp to [0, 100]
```

No LLM calls = no LLM failures. This module is deterministic and cannot crash.

---

---

## 8. RECOMMENDATION ENGINE

### Purpose
Find the optimal product strategy by systematically testing variations and comparing outcomes. Uses the full simulation pipeline internally. Outputs the best strategy + Claude-generated strategic advice.

---

### Inputs (What it receives)
```json
{
  "original_config": { ... },
  "current_score": 74,
  "current_state": { ... },
  "market_context": { ... }
}
```

---

### Steps Taken (in order)

**Step 1 — Generate Price Variants**
```python
base_price = config["product"]["raw_price"]
price_variants = [
    base_price * 0.80,  # -20%
    base_price * 0.90,  # -10%
    base_price,          # original
    base_price * 1.10   # +10%
]
```

**Step 2 — Re-run Simulation for Each Variant**
- For each price variant:
  - Clone config
  - Update price
  - Run full simulation (Market + Customer + Competitor + Investor × 5 steps)
  - Evaluate → get score
  - Store: `{ price, score, final_state }`
- Note: Market Agent is NOT re-called here (market context doesn't change with price)
- Customer, Competitor, Investor ARE re-run (they react to price)

**Step 3 — Find Best Strategy**
```python
best = max(variant_results, key=lambda x: x["score"])
```

**Step 4 — Generate Insight Text (Claude)**
- Pass: best_variant, original_variant, score_delta, market_context
- Claude returns: 2-3 sentence strategic recommendation

**Step 5 — Build Comparison Table**
- All 4 variants with scores for display

---

### Claude Prompt Template (Step 4)
```
System: You are a senior product strategist. Be direct, specific, and actionable.

User:
Original strategy: ₹{original_price} → Score: {original_score}/100
Best strategy found: ₹{best_price} → Score: {best_score}/100
Market context: {market_summary}
Key market events: {key_events}
Demand trend: {demand_trend}
Competition trend: {competition_trend}

In 2-3 sentences, explain WHY the optimal strategy works and what the founder should do RIGHT NOW. Be specific about timing.
```

---

### Output (What it returns)
```json
{
  "original_score": 74,
  "best_price": 2700,
  "best_score": 82,
  "score_improvement": 8,
  "recommendation_type": "price_reduction",
  "strategic_advice": "Reduce pricing to ₹2700 immediately — the LPG crisis has created a 3-6 month window of accelerated demand that competitors are starting to notice. At ₹2700 you hit the sweet spot between middle-income affordability and margin health. Move fast before competition intensifies further.",
  "comparison_table": [
    { "price": 2400, "score": 78, "label": "-20%" },
    { "price": 2700, "score": 82, "label": "-10% ★ BEST" },
    { "price": 3000, "score": 74, "label": "Original" },
    { "price": 3300, "score": 61, "label": "+10%" }
  ]
}
```

---

### Decisions Taken
| Decision | Logic |
|---|---|
| Which variants to test | Always 4: -20%, -10%, original, +10% |
| Whether to test other factors | For MVP: price only. V2 can vary features and audience |
| Best selection | Highest score wins; tie broken by higher price (better margin) |
| When to not recommend price cut | If best_score improvement < 3 points → recommend original with advice to "stay the course" |

---

### Error Handling
```
SIMULATION_FAIL_ON_VARIANT  → skip that variant, continue with others
ALL_VARIANTS_FAIL           → return original strategy as recommendation with warning
CLAUDE_ADVICE_FAIL          → return advice as: "Consider the scoring data above to make your pricing decision."
```

---

### Multi-Strategy Testing (Full Workflow)
```
Input: original_config, market_context (already fetched, reused)

For each price_variant:
    1. Clone config
    2. Update price_index = variant_price / 10000
    3. initialize_state(config_clone)
    4. inject market_context (skip Grok re-call)
    5. run simulation loop (Customer + Competitor + Investor × 5 steps)
    6. evaluate(final_state) → score
    7. store result

Select best → call Claude for advice → return
```

---

---

## SHARED STATE OBJECT (Complete Reference)

This is the full state object at its most complete. Not all fields exist at step 0 — they get added as agents run.

```json
{
  "raw_price": 3000,
  "price_index": 0.30,
  "demand": 0.50,
  "competition": 0.35,
  "confidence": 0.50,
  "risk": 0.30,
  "market_pressure": 0.0,
  "fuel_price_index": 0.0,
  "supply_disruption": 0.0,
  "demand_shift": 0.0,
  "market_volatility": 0.0,
  "price_sensitivity": 0.0,
  "consumer_stress": 0.0,
  "feature_score": 0.75,
  "step": 0,
  "customer_history": [],
  "competitor_history": [],
  "investor_history": []
}
```

---

## AGENT CALL ORDER (Never change this)

```
Per simulation step:
1. customer_agent(state)   → updates demand
2. competitor_agent(state) → reacts to demand, updates competition + price
3. investor_agent(state)   → observes both, updates confidence + risk

Why this order:
- Customer drives the market (primary signal)
- Competitor reacts to customer behavior (secondary reaction)
- Investor observes the full picture last (final judgment)
```

---

## API ENDPOINTS

```
POST /simulate
  Body: raw user input
  Returns: full simulation result

POST /recommend
  Body: config + current_score
  Returns: recommendation object

GET  /health
  Returns: { status: "ok" }

POST /followup  [bonus]
  Body: { question: string, simulation_context: object }
  Returns: Claude answer grounded in simulation results
```

---

*Spec Version 1.0 — Built for hackathon execution*
