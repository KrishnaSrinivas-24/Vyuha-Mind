# Autonomous Multi-Agent Product Strategy Simulator (MVP)

## Run

1. Install dependencies

```bash
pip install -r requirements.txt
```

2. Start API

```bash
uvicorn app.main:app --reload
```

Optional: enable Google ADK agents (live LLM mode)

```bash
set ENABLE_ADK_AGENTS=true
set GOOGLE_API_KEY=your_key_here
set ADK_MODEL=gemini-2.0-flash
```

Optional: enable Grok for Market Analysis Agent

```bash
set GROK_API_KEY=your_xai_key_here
set GROK_MODEL=grok-3-latest
```

Free live market mode (default primary path)

- Google News RSS
- Reddit RSS
- Wikipedia pageviews
- Google Trends (if pytrends is installed)

The market agent auto-selects suitable sources based on orchestrator task context (scenario tag, product, region).

3. Open docs

- http://127.0.0.1:8000/docs

## Endpoints

- `GET /health`
- `POST /simulate`
- `POST /recommend`

## Sample `/simulate` payload

```json
{
  "input": {
    "product_name": "Electric Cooker",
    "product_description": "Induction-based electric cooker for home use",
    "features": ["fast heating", "low power consumption", "auto shutoff"],
    "price": 3000,
    "pricing_strategy": "penetration",
    "target_audience": "middle-class households",
    "market_scenario": "Iran-US war causing LPG shortage in India",
    "region": "India"
  },
  "num_steps": 5
}
```

## Notes

- Agents are wired through Google ADK in app/adk_runtime.py.
- Market Analysis Agent attempts Grok first via app/grok_market.py.
- Market Analysis Agent first tries free-source aggregation via app/free_market_intel.py.
- If free sources are unavailable, it falls back to Grok, then ADK, then deterministic defaults.
- If ENABLE_ADK_AGENTS is false or GOOGLE_API_KEY is missing, the simulator automatically uses deterministic fallback logic.
- If GROK_API_KEY is missing or Grok request fails, market analysis safely falls back.
- ADK mode is optional and can be turned on without changing code.

## 📂 Project Assets & Resources

- **Google Drive (Project Assets & PPTs):** [Access Folder](https://drive.google.com/drive/folders/1ES2mXXCWrBqfzyGqjR9yEwTbyqSp_JD8?usp=sharing)
- **Official Pitch Deck:** [Final_AI_Simulator_Pitch_Deck.pptx](Final_AI_Simulator_Pitch_Deck.pptx)
- **Architecture Flowcharts:** Included in the Pitch Deck.
- **GitHub Repository:** [Vyuha-Mind](https://github.com/KrishnaSrinivas-24/Vyuha-Mind.git)
