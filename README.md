# Autonomous Multi-Agent Product Strategy Simulator

[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135.2-green)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

An intelligent product strategy simulator powered by multi-agent AI reasoning. Uses Claude, Grok, and Google Gemini to simulate product market dynamics, competitive landscapes, and investor sentiment in real-time across various geopolitical scenarios.

## 📋 Overview

A production-ready **multi-agent AI simulator** that validates product-market fit in minutes instead of months. Four specialized AI agents (Market Analysis, Customer, Competitor, Investor) reason through realistic market scenarios and geopolitical crises to provide data-driven strategy recommendations.

**Use this to:**
- Validate product-market fit before expensive market research
- Test pricing & positioning strategies against competitor responses
- Understand market risks in specific geopolitical scenarios
- Generate quantified investment theses for pitch decks
- A/B test strategic variations (pricing, features, positioning)

---

## 🎯 Goal

Build an intelligent, scalable product strategy validation engine that:
1. **Simulates realistic market dynamics** using four specialized AI agents
2. **Provides actionable recommendations** backed by multi-step reasoning
3. **Handles geopolitical complexity** (LPG crisis, E10/E20 transition, supply disruptions)
4. **Gracefully degrades** when APIs fail (deterministic fallbacks for robustness)
5. **Works at enterprise scale** with concurrent simulations, high availability

---

## ✨ Features

### Core Features

- **Multi-Agent Reasoning** — 4 specialized AI agents running in parallel
  - 🌍 **Market Analysis Agent** (Grok): Real-time geopolitical intelligence
  - 👥 **Customer Agent** (Claude): Demand forecasting & sentiment analysis
  - 🎯 **Competitor Agent** (Claude): Competitive response modeling
  - 💰 **Investor Agent** (Claude): Risk/return & investment viability

- **Scenario-Based Simulation** — Pre-built geopolitical scenarios
  - LPG Crisis (India, 2026)
  - E10/E20 Fuel Efficiency Transition
  - Custom crisis scenarios

- **Strategic Recommendations** — AI-generated strategy variations
  - Price optimization (penetration, premium, value-based)
  - Feature positioning tweaks
  - Go-to-market timing analysis
  - Risk mitigation strategies

- **Interactive Dashboard** — Real-time visualization
  - Live agent reasoning logs
  - KPI panels (demand, competition, risk, confidence)
  - Market arena competitive landscape
  - Sentiment heatmaps & competitor matrices

- **Comprehensive Evaluation** — Quantified scoring
  - Success score (0-100)
  - Status categorization (HIGH_POTENTIAL, MODERATE, RISKY, FAIL)
  - Detailed breakdown of demand, competition, confidence, risk
  - Risk flags & warnings

- **Robust Error Handling** — Production-grade resilience
  - Agent timeout protection (12-second limits)
  - API fallback chains (Grok → free sources → ADK → deterministic)
  - Graceful degradation (simulation never fails due to API issues)
  - Comprehensive logging & diagnostics

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│              USER INPUT (Frontend)                   │
│  Product, Features, Price, Market, Scenario, Region │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│          INPUT HANDLER (Validation)                  │
│  • Normalize & validate all fields                   │
│  • Build machine-ready config                        │
│  • Embed product descriptions                        │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│      MARKET ANALYSIS AGENT (Grok/Free/ADK)          │
│  • Real-time geopolitical analysis                   │
│  • Market volatility, demand shifts                  │
│  • Supply disruption assessment                      │
│  Fallback: RSS→Reddit→Wikipedia→Deterministic      │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│   SIMULATION LOOP (5 steps, parallel agents)         │
│                                                       │
│  Step 1-5:                                           │
│  ├─ Customer Agent: demand signal & sentiment        │
│  ├─ Competitor Agent: strategic response & pricing   │
│  └─ Investor Agent: confidence & risk verdict        │
│                                                       │
│  Fallbacks: Claude→Gemini→Deterministic (per agent) │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│       EVALUATION ENGINE (Scoring)                    │
│  • Weighted formula: 40% demand + 30% confidence    │
│  •                   - 20% competition - 10% risk   │
│  • Categorize success status                         │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│    RECOMMENDATION ENGINE (Strategy Variations)       │
│  • Generate 3 strategic variations                   │
│  • Test each with same market conditions             │
│  • Score & rank recommendations                      │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│         RESPONSE (API + Frontend)                    │
│  • Simulation results & agent logs                   │
│  • Market context & reasoning chains                 │
│  • Recommendations ranked by score                   │
│  • Interactive dashboard visualization               │
└──────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
- **Language**: Python 3.9+
- **Framework**: FastAPI 0.135.2 (async, type-safe, auto-docs)
- **Data Validation**: Pydantic 2.12.5 (strict typing, JSON schema)
- **Async Runtime**: Python async/await + ThreadPoolExecutor (agent timeouts)
- **APIs**: 
  - Google ADK 1.27.5 (Gemini integration)
  - Google GenAI 1.56.0 (Gemini API direct)
  - Custom Grok integration (X AI API)
  - RSS/Reddit/Wikipedia aggregation
- **Parsing**: python-docx, pdfplumber (document extraction)
- **Math**: NumPy 1.26.4

### Frontend
- **Framework**: React 18.3.1 (hooks, context, suspense)
- **Build Tool**: Vite 6.2.5 (lightning-fast HMR)
- **Styling**: TailwindCSS 4.1.3 (utility-first CSS)
- **Charts**: ECharts 6.0.0 (advanced visualizations)
- **Charts**: Recharts 2.15.3 (interactive charts)
- **Animations**: Framer Motion 12.38.0
- **Icons**: Lucide React 0.475.0

### DevOps & Infrastructure
- **API Docs**: FastAPI auto-generated Swagger UI + ReDoc
- **CORS**: Enabled for development (configurable for production)
- **Environment**: .env-based configuration
- **Containerization Ready**: Docker-compatible structure

---

## 🚧 Challenges

### 1. **Agent Timeout Resilience**
   **Challenge**: LLM APIs (Claude, Gemini) sometimes hang or respond slowly
   **Solution**: 12-second timeout per agent with ThreadPoolExecutor, graceful fallback to deterministic logic
   **Learning**: Timeouts must be aggressive but fair; balance between reliability and accuracy

### 2. **Real-Time Market Data Quality**
   **Challenge**: Free sources (RSS, Reddit, Wikipedia) are inconsistent and noisy
   **Solution**: Implement cascading fallback chain (Grok → free → ADK → deterministic)
   **Learning**: Always have a deterministic fallback; don't rely entirely on live APIs

### 3. **Agent Reasoning Consistency**
   **Challenge**: LLMs produce variable outputs; sometimes missing required fields
   **Solution**: Strict output schema validation, required key checking, safe default values
   **Learning**: Deterministic logic + optional LLM enhancement = best of both worlds

### 4. **Geopolitical Scenario Modeling**
   **Challenge**: Hard to model how crises affect customer/competitor behavior
   **Solution**: Pre-built scenario templates with adjustable parameters (E10/E20, LPG crisis)
   **Learning**: Start with concrete scenarios, generalize patterns

### 5. **Frontend Real-Time Updates**
   **Challenge**: Need to show agent reasoning as simulation progresses
   **Solution**: Async backend + WebSocket-ready architecture (streaming logs)
   **Learning**: Separate concerns: results vs. progress vs. logs

---

## 🎓 Learnings

### 1. **Multi-Agent Orchestration**
   - Parallel execution > sequential (significant latency improvements)
   - Timeout handling is critical for production reliability
   - Deterministic fallbacks are more important than perfect LLM outputs

### 2. **API Resilience**
   - Design for failure: assume every API call might fail
   - Cascading fallbacks create robust systems (never block the user)
   - Cache market analysis results when possible (reduces API calls)

### 3. **Market Simulation**
   - Blending deterministic + LLM reasoning provides best accuracy
   - Convergence detection (early stop) improves performance without sacrificing quality
   - Step-based adjustments (competitors strengthen late game) improve realism

### 4. **Frontend/Backend Separation**
   - Stateless backend makes scaling easier
   - Clear API contracts (Pydantic models) prevent integration bugs
   - Interactive dashboards require deep frontend architecture

### 5. **Error Messages Matter**
   - Transparent error codes help debugging (agent_timeout:customer vs. agent_fail:competitor)
   - Users want to know why recommendations differ (market volatility, risk flags)
   - Diagnostics data is valuable for optimization

---

## 📊 Current Status

### ✅ Completed
- [x] Core multi-agent orchestration (market, customer, competitor, investor agents)
- [x] Market analysis with Grok integration + free source fallbacks
- [x] Simulation engine with convergence detection
- [x] Evaluation & scoring engine
- [x] Recommendation generation engine
- [x] FastAPI backend with full API (health, simulate, recommend)
- [x] React + Vite frontend dashboard
- [x] Document parsing (PRD extraction from DOCX/PDF)
- [x] Comprehensive type hints & Pydantic validation
- [x] Error handling & timeouts
- [x] Professional documentation (README, CONTRIBUTING, etc.)

### 🎯 In Progress
- [ ] WebSocket real-time updates (agent logs streaming)
- [ ] Batch simulation runner for A/B testing
- [ ] Advanced caching layer (market context caching)

### 📋 Planned
- [ ] Historical data persistence & analytics
- [ ] Custom agent personas (domain-specific reasoning)
- [ ] PDF/PPT report export
- [ ] Docker containerization
- [ ] GitHub Actions CI/CD
- [ ] Horizontal scaling with load balancer

---

## 📊 Key Metrics

| Metric | Value | Target |
|--------|-------|--------|
| **Simulation Time** | ~10-15 sec | < 30 sec |
| **Agent Timeout** | 12 seconds | No agent hangs |
| **Fallback Rate** | ~20% (free sources) | < 50% |
| **Frontend Bundle** | ~200KB gzipped | < 300KB |
| **Type Coverage** | 100% Python | 100% |
| **API Endpoints** | 3 (health, simulate, recommend) | 5+ |

---

---

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 16+ (for frontend)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KrishnaSrinivas-24/Vyuha-Mind.git
   cd Vyuha-Mind
   ```

2. **Set up Python environment**
   ```bash
   python -m venv .venv
   # Windows
   .\.venv\Scripts\activate
   # macOS/Linux
   source .venv/bin/activate
   ```

3. **Install backend dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure API keys** (optional but recommended)
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

5. **Start the backend API**
   ```bash
   uvicorn app.main:app --reload
   ```
   - API docs: http://127.0.0.1:8000/docs
   - Health check: http://127.0.0.1:8000/health

6. **Set up and run frontend** (in new terminal)
   ```bash
   cd AI-Product-Sim/frontend
   npm install
   npm run dev
   ```
   - Frontend: http://localhost:5173

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   USER INPUT                        │
│  (Product, Features, Market, Scenario, Region)      │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│              INPUT HANDLER                           │
│  • Normalize text fields & standardize regions       │
│  • Validate price, features, audience                │
│  • Build machine-ready config object                 │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│         MARKET ANALYSIS AGENT [GROK]                │
│  • Real-time geopolitical context                    │
│  • Market volatility, demand shifts                  │
│  • Competitive landscape assessment                  │
│  Fallback: Free sources (RSS, Reddit, Wikipedia)    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│        SIMULATION LOOP (5 steps, parallelized)       │
│  ┌─────────────────────────────────────────────────┐ │
│  │ CUSTOMER AGENT [CLAUDE]                         │ │
│  │ • Demand signals, purchasing intent             │ │
│  │ • Feature preferences, price sensitivity        │ │
│  │ • Repeat purchase propensity                    │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │ COMPETITOR AGENT [CLAUDE]                       │ │
│  │ • Competitive responses & pricing               │ │
│  │ • Feature parity attacks                        │ │
│  │ • Market share dynamics                         │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │ INVESTOR AGENT [CLAUDE]                         │ │
│  │ • Risk/return analysis                          │ │
│  │ • Funding potential, valuations                 │ │
│  │ • Growth trajectory assessment                  │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│         EVALUATION ENGINE                            │
│  • Weighted score: Demand (40%) + Confidence (30%) │
│  •              - Competition (20%) - Risk (10%)    │
│  • Status: HIGH_POTENTIAL | MODERATE | RISKY | FAIL │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│       RECOMMENDATION ENGINE [CLAUDE]                 │
│  • Generate 3 strategic variations                   │
│  • Price/positioning/feature tweaks                  │
│  • Simulate & score each variant                     │
│  • Return ranked recommendations                     │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│            INTERACTIVE DASHBOARD                     │
│  • Real-time simulation progress                     │
│  • Agent reasoning logs & transparency               │
│  • Market context visualization                      │
│  • Strategic recommendations & scoring               │
└──────────────────────────────────────────────────────┘
```

### AI Model Assignment

| Component | Model | Reason |
|---|---|---|
| **Market Analysis Agent** | Grok 3.0 | Real-time geopolitical + X/Twitter data for market intel |
| **Customer Agent** | Claude 3.5 Sonnet | Deep behavioral reasoning & persona logic |
| **Competitor Agent** | Claude 3.5 Sonnet | Strategic competitive thinking & response modeling |
| **Investor Agent** | Claude 3.5 Sonnet | Financial risk/return evaluation & nuanced reasoning |
| **Recommendation Engine** | Claude 3.5 Sonnet | Synthesis & strategic advice generation |

---

## 📁 Project Structure

```
Vyuha-Mind/
├── app/                                 # Backend Python application
│   ├── main.py                         # FastAPI application entry point
│   ├── orchestrator.py                 # Multi-agent orchestration logic
│   ├── agents.py                       # Agent implementations (market, customer, competitor, investor)
│   ├── evaluation.py                   # Scoring & evaluation engine
│   ├── recommendation.py               # Recommendation generation logic
│   ├── input_handler.py                # Input validation & normalization
│   ├── models.py                       # Pydantic data models & schemas
│   ├── adk_runtime.py                  # Google ADK (Gemini) integration
│   ├── grok_market.py                  # Grok market analysis integration
│   ├── free_market_intel.py            # RSS/Reddit/Wikipedia market data aggregation
│   ├── utils.py                        # Utility functions & scenario defaults
│   └── key_manager.py                  # API key management & rotation
│
├── AI-Product-Sim/frontend/            # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx                    # Main application shell
│   │   ├── components/
│   │   │   ├── dashboard/             # KPI panels, market arena, heatmaps
│   │   │   ├── agents/                # Agent logs, reasoning visualization
│   │   │   ├── controls/              # Simulation controls, config UI
│   │   │   ├── layout/                # Header, warroom layout
│   │   │   └── shared/                # Reusable UI components
│   │   ├── services/                  # API client & WebSocket handlers
│   │   ├── context/                   # React context for simulation state
│   │   └── utils/                     # Formatting & helper functions
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── docs/                               # Project documentation
│   ├── HACKATHON_STRATEGY.md          # High-level product strategy
│   ├── PRD_E10_E20_Transition.md      # Fuel efficiency scenario PRD
│   └── PRD_LPG_Crisis_2026.md         # Crisis scenario PRD
│
├── tests/                              # Test suite
│   ├── test_api.py                    # API endpoint tests
│   └── test_diagnostics.py            # System diagnostic tests
│
├── simulator_spec.md                   # Detailed technical specification
├── requirements.txt                    # Python dependencies
├── .env.example                        # Environment variables template
├── .gitignore                          # Git ignore rules
├── README.md                           # This file
└── CONTRIBUTING.md                     # Contribution guidelines
```

---

## 🔌 API Reference

### Health Check
```bash
curl http://127.0.0.1:8000/health
```

### Run Simulation
```bash
POST /simulate
Content-Type: application/json

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

**Response:**
```json
{
  "simulation_id": "sim-abc123",
  "steps_run": 5,
  "history": [...],
  "agent_logs": [...],
  "market_context": {...},
  "evaluation": {
    "success_score": 78,
    "status": "MODERATE_POTENTIAL",
    "breakdown": {...}
  },
  "recommendation": {
    "suggested_strategies": [...],
    "key_risks": [...],
    "opportunities": [...]
  },
  "final_state": {...}
}
```

### Get Recommendations
```bash
POST /recommend
Content-Type: application/json

{
  "config": {...},
  "current_score": 65,
  "num_steps": 5
}
```

See [API docs](http://127.0.0.1:8000/docs) for full endpoint specifications.

---

## 🎛️ Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Google Gemini API (free tier available)
GEMINI_KEYS=your_key_1,your_key_2

# Enable Google ADK agents (live LLM mode)
ENABLE_ADK_AGENTS=true

# Grok API for market analysis (optional)
GROK_API_KEY=your_xai_key
GROK_MODEL=grok-3-latest

# Anthropic Claude (if using directly)
CLAUDE_API_KEY=your_anthropic_key
```

### Fallback Logic Chain

1. **Market Analysis**: Grok → Free sources (RSS/Reddit) → ADK Gemini → Deterministic defaults
2. **Agent Reasoning**: Claude (if available) → ADK Gemini → Timeout handling + safe defaults
3. **Graceful Degradation**: All agents have safe fallback values; simulation never fails due to API errors

---

## 💡 Key Features

### ✅ Multi-Agent Reasoning
- Four specialized AI agents running in parallel
- Each agent has distinct expertise and reasoning patterns
- Timeout handling (12 seconds per agent)
- Agent failures don't halt simulation

### ✅ Real-Time Market Intelligence
Aggregates multiple data sources:
- **Google News RSS** — Latest industry news
- **Reddit** — Community sentiment & discussion
- **Wikipedia Pageviews** — Trending topics & interest indicators
- **Google Trends** — Search interest trajectories
- **Grok API** — Real-time X/Twitter analysis & geopolitical context

### ✅ Interactive Dashboard
- Real-time simulation progress tracking
- Agent reasoning transparency
- Market context visualization
- KPI panels (demand, competition, confidence, risk)
- Strategic recommendations ranked by score

### ✅ Comprehensive Logging
- Agent execution logs with timestamps
- Market analysis reasoning chains
- Evaluation breakdown and scoring details
- Diagnostics for debugging & analysis

### ✅ Production-Ready Error Handling
- Input validation with detailed error messages
- Agent timeout recovery
- API key rotation & fallback
- Deterministic defaults ensure robust fallback behavior

---

## 🧪 Testing

Run the test suite:

```bash
# Test API endpoints
python -m pytest tests/test_api.py -v

# Test diagnostics & fallback logic
python -m pytest tests/test_diagnostics.py -v

# Run all tests
python -m pytest tests/ -v
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:
- Code style & formatting
- Testing requirements
- Pull request process
- Issue reporting

---

## 📚 Documentation

- **[Simulator Spec](./simulator_spec.md)** — Detailed technical architecture & component behavior
- **[Strategy Doc](./docs/HACKATHON_STRATEGY.md)** — High-level product vision
- **[LPG Crisis Scenario](./docs/PRD_LPG_Crisis_2026.md)** — Crisis scenario details
- **[E10-E20 Scenario](./docs/PRD_E10_E20_Transition.md)** — Fuel efficiency transition scenario
- **[Frontend README](./AI-Product-Sim/frontend/README.md)** — UI architecture & component guide

---

## 🎓 Use Cases

### 1. **Startup Validation** 
Validate product-market fit before expensive market research or MVP development.

### 2. **Strategic Pivoting**
Test new markets, pricing strategies, and positioning without real-world risk.

### 3. **Competitive Analysis**
Model competitor responses to your product launch and pricing changes.

### 4. **Investor Storytelling**
Generate quantified risk/return analyses for investor pitches.

### 5. **Market Crisis Planning**
Simulate how your product performs during geopolitical shocks or supply chain disruptions.

---

## 🔐 Security & Privacy

- **No data persistence** — All simulations are ephemeral
- **API key isolation** — Keys are managed through environment variables
- **Rate limiting** — Prevents abuse of external APIs
- **Input validation** — All user inputs are sanitized and validated
- **Error messages** — Safe error handling without exposing sensitive data

---

## 📈 Performance & Scalability

- **Concurrent agents** — Parallel execution reduces latency
- **Timeout handling** — 12-second agent timeouts prevent hanging
- **Lightweight frontend** — Vite + React optimized bundle (~200KB gzipped)
- **Stateless backend** — Easily horizontally scalable
- **Caching** — Market analysis results cached to reduce API calls

---

## 🚧 Roadmap

- [ ] WebSocket real-time updates for simulation progress
- [ ] Batch simulation runner for A/B testing campaigns
- [ ] Historical data persistence & analytics
- [ ] Custom agent personas for specific domains
- [ ] Export reports (PDF/PPT)
- [ ] Docker containerization for deployment
- [ ] GraphQL API layer

---

## 📞 Support & Contact

For issues, questions, or suggestions:
- **GitHub Issues**: [Report bugs](https://github.com/KrishnaSrinivas-24/Vyuha-Mind/issues)
- **Discussions**: [GitHub Discussions](https://github.com/KrishnaSrinivas-24/Vyuha-Mind/discussions)
- **Email**: Contact via GitHub profile

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

- **Google ADK** — For Gemini integration
- **Anthropic** — For Claude API
- **X AI** — For Grok integration
- **FastAPI** — Modern Python web framework
- **React + Vite** — Lightning-fast frontend development

---

## 🎯 Project Stats

- **Backend**: Python, FastAPI, Pydantic, async/await
- **Frontend**: React 18, Vite, TailwindCSS, ECharts
- **AI Models**: Claude 3.5 Sonnet, Grok 3.0, Gemini 2.0 Flash
- **APIs**: 3 endpoints (health, simulate, recommend)
- **Agents**: 4 specialized AI agents
- **Components**: 20+ React components
- **Type Coverage**: 100% type hints in Python backend

---

**Made with ❤️ for innovators, entrepreneurs, and AI enthusiasts.**

## 📂 Project Assets & Resources

- **Google Drive (Project Assets & PPTs):** [Access Folder](https://drive.google.com/drive/folders/1ES2mXXCWrBqfzyGqjR9yEwTbyqSp_JD8?usp=sharing)
- **GitHub Repository:** [Vyuha-Mind](https://github.com/KrishnaSrinivas-24/Vyuha-Mind.git)
