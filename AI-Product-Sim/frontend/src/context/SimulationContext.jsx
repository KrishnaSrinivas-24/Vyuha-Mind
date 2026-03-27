import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { runPipeline } from '../services/simulationApi';

const SimulationContext = createContext(null);

const FEATURE_MAP = {
  'route-opt': 'Route Optimization',
  'fuel-analytics': 'Fuel Analytics',
  'fleet-track': 'Fleet Tracking',
  'pred-maint': 'Predictive Maintenance',
  'driver-score': 'Driver Scoring',
  'ev-integration': 'EV Integration',
  'carbon-report': 'Carbon Reporting',
  'realtime-alerts': 'Real-time Alerts',
};

const TARGET_MAP = {
  'smb-logistics': 'middle_income',
  'enterprise-fleet': 'enterprise',
  'restaurant-chains': 'budget',
  'urban-delivery': 'middle_income',
};

const BASE_STATE = {
  running: false,
  tick: 0,
  speed: 1,
  crisisActive: false,
  crisisIntensity: 0,
  productConfig: {
    name: 'Project Alpha',
    price: 1999,
    features: ['Route Optimization', 'Fleet Tracking'],
    target: 'enterprise-fleet',
    adSpend: 500000,
  },
  kpis: {
    pos: 0,
    marketShare: 0,
    cashBurn: 0,
    churn: 0,
    revenue: 0,
    activeAgents: 4,
  },
  demandSupply: [],
  historicalData: [],
  agentStates: [],
  agentLogs: [],
  sentimentHeatmap: [],
  competitors: [],
  statusLights: {
    supplyChain: 'yellow',
    sentiment: 'yellow',
    competitors: 'yellow',
    financial: 'yellow',
  },
  pipelineOutputs: null,
  loading: true,
  error: null,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatFeatures(features) {
  return (features || []).map((f) => FEATURE_MAP[f] || f);
}

function toPayload(config, crisisIntensity = 0) {
  const scenario = crisisIntensity > 0
    ? `Severe fuel supply disruption crisis is active. Crisis intensity: ${Math.round(crisisIntensity * 100)}%. Competitors are repricing aggressively and customer spending is constrained.`
    : (config.marketScenario || 'Market operating in normal competitive conditions with moderate volatility in India.');

  return {
    input: {
      product_name: config.name || 'Project Alpha',
      product_description: config.description || `AI strategy product for ${config.target || 'enterprise-fleet'} with monthly ad spend ${config.adSpend || 0}.`,
      features: formatFeatures(config.features),
      price: Number(config.price || 1999),
      pricing_strategy: config.pricingStrategy || 'competitive',
      target_audience: TARGET_MAP[config.target] || 'middle_income',
      market_scenario: scenario,
      region: config.region || 'IN',
    },
    num_steps: 5,
  };
}

function buildDemandSupply(comparisonTable, history) {
  if (!comparisonTable || comparisonTable.length === 0) {
    return (history || []).map((h, idx) => ({
      price: Math.round(h.raw_price || 1500) + idx * 50,
      demand: Math.round((h.demand || 0.5) * 100),
      supply: Math.round(45 + (h.competition || 0.5) * 45),
    }));
  }
  return comparisonTable.map((row, idx) => ({
    price: Math.round(row.price),
    demand: clamp(Math.round((history[idx]?.demand || 0.65) * 100), 0, 100),
    supply: clamp(Math.round(40 + (history[idx]?.competition || 0.5) * 50), 0, 100),
  }));
}

function buildHistorical(history) {
  return (history || []).map((h, idx) => ({
    tick: idx + 1,
    day: `Day ${idx + 1}`,
    pos: clamp(Math.round(((1 - (h.risk || 0)) * 0.45 + (h.confidence || 0) * 0.55) * 100), 0, 100),
    marketShare: clamp(+((h.demand || 0) * (1 - (h.competition || 0) * 0.35) * 100).toFixed(1), 0, 100),
    revenue: Math.max(0, Math.round((h.raw_price || 0) * (h.demand || 0) * 150)),
    sentiment: clamp(Math.round((1 - (h.consumer_stress || 0.5)) * 100), 0, 100),
    inflation: +((h.fuel_price_index || 0.5) * 10).toFixed(1),
  }));
}

function buildHeatmap(finalState) {
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'];
  const stress = finalState?.consumer_stress || 0.5;
  const pressure = finalState?.market_pressure || 0.5;
  return cities.map((city, idx) => {
    const base = 72 - idx * 2;
    return {
      city,
      Fleet: clamp(Math.round(base - stress * 35), 5, 95),
      Retail: clamp(Math.round(base - pressure * 28), 5, 95),
      Enterprise: clamp(Math.round(base - stress * 18 + 8), 5, 95),
      Startup: clamp(Math.round(base - pressure * 22 - 4), 5, 95),
    };
  });
}

function flattenAgentOutputs(pipeline) {
  const logs = [];
  const market = pipeline?.market_analyzer_agent?.market_context || {};
  const marketState = pipeline?.market_analyzer_agent?.market_state || {};
  const evaluation = pipeline?.evaluation_engine || {};
  const recommendation = pipeline?.recommendation_engine || {};
  const perStep = pipeline?.simulation_loop?.agent_logs || [];
  const history = pipeline?.simulation_loop?.history || [];
  const finalState = pipeline?.simulation_loop?.final_state || {};

  // --- Input Handler ---
  const inputWarnings = pipeline?.input_handler?.warnings || [];
  logs.push({
    id: 'input-handler',
    tick: 0,
    agentType: 'analyst',
    agentName: 'Input Handler',
    executionMode: 'deterministic',
    message: inputWarnings.length
      ? `Config normalized with ${inputWarnings.length} warning(s): ${inputWarnings.join(', ')}`
      : 'Config normalized successfully. All fields validated.',
    sentiment: inputWarnings.length ? 'warning' : 'positive',
  });

  // --- Orchestrator ---
  const diag = pipeline?.orchestrator || {};
  logs.push({
    id: 'orchestrator',
    tick: 0,
    agentType: 'analyst',
    agentName: 'Orchestrator',
    executionMode: 'deterministic',
    message: `Pipeline initialized. Requested ${diag.steps_requested || 5} steps, executed ${diag.steps_run || 0}.${diag.diagnostics?.convergence_triggered ? ` Early convergence at step ${diag.diagnostics.convergence_step}.` : ''}`,
    sentiment: 'neutral',
  });

  // --- Market Analyzer ---
  const marketExecMode = market.execution_mode || diag.diagnostics?.market_execution_mode || 'unknown';
  const keyEvents = market.key_events || [];
  const marketMsg = [
    market.summary || 'Market summary unavailable.',
    keyEvents.length ? `Key events: ${keyEvents.join(' · ')}` : '',
    market.sources_used?.length ? `Sources: ${market.sources_used.join(', ')}` : '',
  ].filter(Boolean).join('\n');
  logs.push({
    id: 'market',
    tick: 0,
    agentType: 'analyst',
    agentName: 'Market Analyzer',
    executionMode: marketExecMode,
    message: marketMsg,
    sentiment: 'positive',
  });

  // --- Per-Step Agent Logs ---
  perStep.forEach((entry, idx) => {
    const step = entry.step || idx + 1;
    const stepState = history[idx] || {};

    // Customer Agent — full reasoning + verdict
    const custReasoning = entry.customer?.reasoning || 'No customer reasoning provided.';
    const custSentiment = entry.customer?.sentiment || 'neutral';
    const custMode = entry.customer?.execution_mode || 'deterministic';
    logs.push({
      id: `customer-${step}`,
      tick: step,
      agentType: 'consumer',
      agentName: 'Customer Agent',
      executionMode: custMode,
      message: custReasoning,
      sentiment: ['very_positive', 'positive'].includes(custSentiment) ? 'positive' : custSentiment === 'negative' || custSentiment === 'very_negative' ? 'negative' : 'neutral',
      meta: {
        demand: stepState.demand != null ? (stepState.demand * 100).toFixed(1) + '%' : null,
        sentiment: custSentiment,
      },
    });

    // Competitor Agent — strategy + reasoning + action
    const compStrategy = entry.competitor?.strategy || 'monitoring';
    const compAction = entry.competitor?.action || 'none';
    const compMode = entry.competitor?.execution_mode || 'deterministic';
    const compHistory = stepState.competitor_history || [];
    const compEntry = compHistory.find((h) => h.step === step) || {};
    const compReasoning = compEntry.reasoning || `Threat level triggered ${compStrategy} response.`;
    logs.push({
      id: `competitor-${step}`,
      tick: step,
      agentType: 'competitor',
      agentName: 'Competitor Agent',
      executionMode: compMode,
      message: `[${compStrategy.toUpperCase()}] ${compReasoning}`,
      sentiment: compAction === 'price_cut' ? 'negative' : compStrategy === 'aggressive' ? 'aggressive' : 'neutral',
      meta: {
        strategy: compStrategy,
        action: compAction,
        competition: stepState.competition != null ? (stepState.competition * 100).toFixed(1) + '%' : null,
        price: stepState.raw_price != null ? '₹' + Math.round(stepState.raw_price) : null,
      },
    });

    // Investor Agent — verdict + risk flags + reasoning
    const invVerdict = entry.investor?.verdict || 'hold';
    const invRiskFlag = entry.investor?.risk_flag;
    const invMode = entry.investor?.execution_mode || 'deterministic';
    const invHistory = stepState.investor_history || [];
    const invEntry = invHistory.find((h) => h.step === step) || {};
    const invReasoning = invEntry.reasoning || `Verdict: ${invVerdict}`;
    const invRiskFlags = invEntry.risk_flags || [];
    const riskFlagText = invRiskFlags.length ? ` ⚠ ${invRiskFlags.join(', ')}` : '';
    logs.push({
      id: `investor-${step}`,
      tick: step,
      agentType: 'investor',
      agentName: 'Investor Agent',
      executionMode: invMode,
      message: `[${invVerdict.toUpperCase()}] ${invReasoning}${riskFlagText}`,
      sentiment: invVerdict === 'buy' || invVerdict === 'strong_buy' ? 'positive' : invVerdict === 'avoid' || invVerdict === 'sell' ? 'negative' : 'neutral',
      meta: {
        verdict: invVerdict,
        confidence: stepState.confidence != null ? (stepState.confidence * 100).toFixed(1) + '%' : null,
        risk: stepState.risk != null ? (stepState.risk * 100).toFixed(1) + '%' : null,
        riskFlags: invRiskFlags,
      },
    });
  });

  // --- Evaluation Engine ---
  const evalBreakdown = evaluation.breakdown || {};
  const evalTrends = evaluation.trends || {};
  const evalMsg = [
    `Success Score: ${Math.round(evaluation.success_score || 0)}/100 — ${evaluation.status || 'UNKNOWN'}`,
    evaluation.summary || '',
    `Demand: ${evalBreakdown.demand_health || '?'} (${evalTrends.demand_trend || 'Stable'}) · Competition: ${evalBreakdown.competition_pressure || '?'} (${evalTrends.competition_trend || 'Stable'})`,
    `Confidence: ${evalBreakdown.investor_confidence || '?'} · Risk: ${evalBreakdown.market_risk || '?'}`,
  ].filter(Boolean).join('\n');
  logs.push({
    id: 'evaluation',
    tick: history.length,
    agentType: 'analyst',
    agentName: 'Evaluation Engine',
    executionMode: 'deterministic',
    message: evalMsg,
    sentiment: (evaluation.success_score || 0) >= 65 ? 'positive' : (evaluation.success_score || 0) >= 45 ? 'warning' : 'negative',
  });

  // --- Recommendation Engine ---
  const recMsg = [
    recommendation.strategic_advice || `Best price: ₹${recommendation.best_price || 'n/a'}`,
    recommendation.score_improvement > 0
      ? `Score improvement: +${recommendation.score_improvement} pts (₹${recommendation.best_price} → ${recommendation.best_score}/100)`
      : '',
    recommendation.recommendation_type ? `Strategy: ${recommendation.recommendation_type.replace(/_/g, ' ')}` : '',
  ].filter(Boolean).join('\n');
  logs.push({
    id: 'recommendation',
    tick: history.length,
    agentType: 'investor',
    agentName: 'Recommendation Engine',
    executionMode: 'deterministic',
    message: recMsg,
    sentiment: 'positive',
  });

  return logs;
}

function mapCompetitors(finalState) {
  const history = finalState?.competitor_history || [];
  return history.map((entry, idx) => ({
    id: `competitor-${idx + 1}`,
    name: `Rival ${idx + 1}`,
    strategy: String(entry.strategy || 'maintain').toUpperCase(),
    alive: true,
    price: Math.round(entry.price || 0),
    marketShare: clamp(Math.round((entry.competition || 0.5) * 100), 0, 100),
    cashReserveMonths: clamp(Math.round(14 - idx * 3), 2, 24),
  }));
}

function statusFromFinal(finalState) {
  const risk = finalState?.risk || 0.5;
  const stress = finalState?.consumer_stress || 0.5;
  const competition = finalState?.competition || 0.5;
  const confidence = finalState?.confidence || 0.5;
  const toLight = (v, invert = false) => {
    const x = invert ? 1 - v : v;
    if (x > 0.7) return 'red';
    if (x > 0.45) return 'yellow';
    return 'green';
  };
  return {
    supplyChain: toLight(stress),
    sentiment: toLight(stress),
    competitors: toLight(competition),
    financial: toLight(confidence, true),
  };
}

function buildKpis(stepState, evaluationScore, logsCount) {
  const pos = clamp(Math.round(((stepState.confidence || 0) * 70 + (1 - (stepState.risk || 0)) * 30)), 0, 100);
  return {
    pos: evaluationScore > 0 ? Math.round(evaluationScore) : pos,
    marketShare: clamp(+((stepState.demand || 0) * (1 - (stepState.competition || 0) * 0.35) * 100).toFixed(1), 0, 100),
    cashBurn: Math.round(90000 + (stepState.risk || 0.5) * 180000),
    churn: clamp(Math.round((stepState.risk || 0) * 30), 0, 99),
    revenue: Math.max(0, Math.round((stepState.raw_price || 0) * (stepState.demand || 0) * 150)),
    activeAgents: clamp(logsCount, 4, 200),
  };
}

export function SimulationProvider({ children, initialConfig }) {
  const [state, setState] = useState({
    ...BASE_STATE,
    productConfig: {
      ...BASE_STATE.productConfig,
      ...(initialConfig || {}),
    },
  });

  const [timeline, setTimeline] = useState({
    history: [],
    fullHistorical: [],
    fullLogs: [],
    pipeline: null,
    evalScore: 0,
  });

  const timerRef = useRef(null);

  const deriveStepState = (prev, history, fullHistorical, fullLogs, evalScore, index, options = {}) => {
    if (!history.length) return prev;
    const safeIdx = clamp(index, 0, history.length - 1);
    const stepState = history[safeIdx];
    const tick = safeIdx + 1;
    const logs = fullLogs.filter((l) => l.tick <= tick || l.tick === 0);

    return {
      ...prev,
      tick,
      kpis: buildKpis(stepState, evalScore, logs.length),
      crisisIntensity: stepState.risk || 0,
      historicalData: fullHistorical.slice(0, tick),
      competitors: mapCompetitors(stepState),
      agentLogs: logs,
      statusLights: {
        ...prev.statusLights,
        ...statusFromFinal(stepState),
      },
      running: options.running ?? prev.running,
    };
  };

  const applyStep = (index, options = {}) => {
    setState((prev) => deriveStepState(
      prev,
      timeline.history,
      timeline.fullHistorical,
      timeline.fullLogs,
      timeline.evalScore,
      index,
      options,
    ));
  };

  const loadSimulation = async (config, crisisIntensity = 0) => {
    setState((prev) => ({ ...prev, loading: true, error: null, running: false }));
    try {
      const payload = toPayload(config, crisisIntensity);
      const pipeline = await runPipeline(payload);
      const history = pipeline?.simulation_loop?.history || [];
      const finalState = pipeline?.simulation_loop?.final_state || history[history.length - 1] || {};
      const demandSupply = buildDemandSupply(pipeline?.recommendation_engine?.comparison_table || [], history);
      const fullHistorical = buildHistorical(history);
      const fullLogs = flattenAgentOutputs(pipeline);
      const evalScore = pipeline?.evaluation_engine?.success_score || 0;

      setTimeline({ history, fullHistorical, fullLogs, pipeline, evalScore });

      setState((prev) => {
        const base = {
          ...prev,
          loading: false,
          error: null,
          running: false,
          productConfig: { ...prev.productConfig, ...config },
          demandSupply,
          sentimentHeatmap: buildHeatmap(finalState),
          pipelineOutputs: pipeline,
        };
        if (!history.length) {
          return base;
        }
        return deriveStepState(base, history, fullHistorical, fullLogs, evalScore, 0, { running: false });
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error?.message || 'Simulation failed',
        running: false,
      }));
    }
  };

  useEffect(() => {
    loadSimulation(initialConfig || BASE_STATE.productConfig, 0);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!state.running || !timeline.history.length) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const interval = Math.max(200, Math.round(1200 / (state.speed || 1)));
    timerRef.current = setInterval(() => {
      setState((prev) => {
        const historyLen = timeline.history.length;
        if (!historyLen) return { ...prev, running: false };
        const nextTick = prev.tick + 1;
        if (nextTick > historyLen) {
          return { ...prev, running: false };
        }
        const nextIndex = nextTick - 1;
        return deriveStepState(
          prev,
          timeline.history,
          timeline.fullHistorical,
          timeline.fullLogs,
          timeline.evalScore,
          nextIndex,
          { running: nextTick < historyLen },
        );
      });
    }, interval);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.running, state.speed, timeline.history.length, timeline.fullHistorical, timeline.fullLogs, timeline.evalScore, timeline.history]);

  const api = useMemo(() => {
    const start = async () => {
      if (!timeline.history.length) {
        await loadSimulation(state.productConfig, state.crisisActive ? state.crisisIntensity : 0);
      }
      if (state.tick >= timeline.history.length && timeline.history.length > 0) {
        applyStep(0, { running: true });
        return;
      }
      setState((prev) => ({ ...prev, running: true }));
    };

    const pause = () => setState((prev) => ({ ...prev, running: false }));

    const step = () => {
      const next = clamp((state.tick || 0), 0, Math.max(0, timeline.history.length - 1));
      applyStep(next, { running: false });
    };

    const reset = async () => {
      await loadSimulation(state.productConfig, state.crisisActive ? state.crisisIntensity : 0);
    };

    const setSpeed = (speed) => setState((prev) => ({ ...prev, speed }));

    const injectCrisis = async (intensity = 1) => {
      setState((prev) => ({ ...prev, crisisActive: true, crisisIntensity: intensity, running: false }));
      await loadSimulation(state.productConfig, intensity);
    };

    const resolveCrisis = async () => {
      setState((prev) => ({ ...prev, crisisActive: false, crisisIntensity: 0, running: false }));
      await loadSimulation(state.productConfig, 0);
    };

    const updateProduct = async (updates) => {
      const merged = { ...state.productConfig, ...updates };
      setState((prev) => ({ ...prev, productConfig: merged, running: false }));
      await loadSimulation(merged, state.crisisActive ? state.crisisIntensity : 0);
    };

    return {
      start,
      pause,
      step,
      reset,
      setSpeed,
      injectCrisis,
      resolveCrisis,
      updateProduct,
      reload: () => loadSimulation(state.productConfig, state.crisisActive ? state.crisisIntensity : 0),
    };
  }, [state.productConfig, state.crisisActive, state.crisisIntensity, state.tick, timeline.history.length]);

  const value = {
    ...state,
    state,
    pos: state.kpis?.pos || 0,
    demoState: state.crisisActive ? 'CLIMAX' : 'CALM',
    startSimulation: api.start,
    triggerCrisis: api.injectCrisis,
    resolveCrisis: api.resolveCrisis,
    actions: api,
  };

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}

export const useSimulation = () => useContext(SimulationContext);
