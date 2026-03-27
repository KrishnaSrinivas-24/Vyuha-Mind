from __future__ import annotations

from copy import deepcopy
from typing import Any, Dict

from app.adk_runtime import AdkJsonAgentRunner
from app.free_market_intel import fetch_free_market_intel
from app.grok_market import get_grok_market_analysis
from app.utils import SCENARIO_DEFAULTS, clamp


_adk_runner = AdkJsonAgentRunner()


def _apply_market_context_adjustments(
    values: Dict[str, float],
    *,
    scenario_tag: str,
    product: str,
    region: str,
    strategy: str,
) -> Dict[str, float]:
    adjusted = deepcopy(values)

    if product == "electric cooker" and scenario_tag == "energy_crisis":
        adjusted["demand_shift"] = clamp(adjusted["demand_shift"] + 0.15)
    if region == "IN":
        adjusted["price_sensitivity"] = clamp(adjusted["price_sensitivity"] + 0.1)
        adjusted["consumer_stress"] = clamp(adjusted["consumer_stress"] + 0.05)
    if region == "US":
        adjusted["price_sensitivity"] = clamp(adjusted["price_sensitivity"] - 0.05)
    if region == "EU":
        adjusted["market_volatility"] = clamp(adjusted["market_volatility"] + 0.05)
    if scenario_tag == "geopolitical_crisis":
        adjusted["market_volatility"] = clamp(adjusted["market_volatility"] + 0.2)

    if strategy == "penetration":
        adjusted["price_sensitivity"] = clamp(adjusted["price_sensitivity"] * 1.2)
    elif strategy == "premium":
        adjusted["price_sensitivity"] = clamp(adjusted["price_sensitivity"] * 0.7)

    return adjusted


def market_analysis_agent(config: Dict[str, Any]) -> Dict[str, Any]:
    scenario_tag = config["market"]["scenario_tag"]
    defaults = deepcopy(SCENARIO_DEFAULTS.get(scenario_tag, SCENARIO_DEFAULTS["stable_market"]))

    product = config["product"]["name"]
    region = config["market"]["region"]
    strategy = config["product"].get("pricing_strategy", "")

    defaults = _apply_market_context_adjustments(
        defaults,
        scenario_tag=scenario_tag,
        product=product,
        region=region,
        strategy=strategy,
    )

    free_output = fetch_free_market_intel(config)
    if free_output:
        for key in [
            "fuel_price_index",
            "supply_disruption",
            "demand_shift",
            "market_volatility",
            "price_sensitivity",
            "market_pressure",
            "consumer_stress",
            "regulatory_risk",
            "tech_maturity",
            "sentiment_hype",
        ]:
            defaults[key] = clamp(float(free_output[key]))
        defaults = _apply_market_context_adjustments(
            defaults,
            scenario_tag=scenario_tag,
            product=product,
            region=region,
            strategy=strategy,
        )
        return {
            **defaults,
            "summary": free_output.get("summary", "Live market snapshot unavailable."),
            "key_events": free_output.get("key_events", []),
            "sources_used": free_output.get("sources_used", []),
            "execution_mode": "free_market_intel",
        }

    grok_output = get_grok_market_analysis(config)
    if grok_output:
        for key in [
            "fuel_price_index",
            "supply_disruption",
            "demand_shift",
            "market_volatility",
            "price_sensitivity",
            "market_pressure",
            "consumer_stress",
            "regulatory_risk",
            "tech_maturity",
            "sentiment_hype",
        ]:
            defaults[key] = clamp(float(grok_output[key]))
        defaults = _apply_market_context_adjustments(
            defaults,
            scenario_tag=scenario_tag,
            product=product,
            region=region,
            strategy=strategy,
        )
        return {
            **defaults,
            "summary": grok_output.get("summary", "Grok market summary unavailable."),
            "key_events": grok_output.get("key_events", []),
            "sources_used": ["grok"],
            "execution_mode": "grok",
        }

    adk_output = _adk_runner.run_json_agent(
        name="market_analysis_agent",
        instruction=(
            "You are a market analysis agent. Return strict JSON only with numeric"
            " fields in [0,1], plus summary and key_events."
        ),
        prompt=(
            f"Scenario: {config['market']['raw_scenario']}\n"
            f"Scenario Tag: {scenario_tag}\n"
            f"Product: {product}\n"
            f"Region: {region}\n"
            f"Pricing Strategy: {strategy}\n"
            "Provide realistic market variables for this context."
        ),
        output_schema={
            "type": "object",
            "properties": {
                "fuel_price_index": {"type": "number"},
                "supply_disruption": {"type": "number"},
                "demand_shift": {"type": "number"},
                "market_volatility": {"type": "number"},
                "price_sensitivity": {"type": "number"},
                "market_pressure": {"type": "number"},
                "consumer_stress": {"type": "number"},
                "summary": {"type": "string"},
                "key_events": {"type": "array", "items": {"type": "string"}},
            },
            "required": [
                "fuel_price_index",
                "supply_disruption",
                "demand_shift",
                "market_volatility",
                "price_sensitivity",
                "market_pressure",
                "consumer_stress",
                "summary",
                "key_events",
            ],
        },
    )

    if adk_output:
        for key in [
            "fuel_price_index",
            "supply_disruption",
            "demand_shift",
            "market_volatility",
            "price_sensitivity",
            "market_pressure",
            "consumer_stress",
            "regulatory_risk",
            "tech_maturity",
            "sentiment_hype",
        ]:
            if key in adk_output:
                defaults[key] = clamp(float(adk_output[key]))
        defaults = _apply_market_context_adjustments(
            defaults,
            scenario_tag=scenario_tag,
            product=product,
            region=region,
            strategy=strategy,
        )
        summary = str(adk_output.get("summary", "")).strip() or (
            f"Scenario '{scenario_tag}' is active for region {region}."
        )
        key_events = adk_output.get("key_events", [])
        if not isinstance(key_events, list):
            key_events = []
        return {
            **defaults,
            "summary": summary,
            "key_events": [str(x) for x in key_events][:5],
            "sources_used": ["adk"],
            "execution_mode": "adk",
        }

    return {
        **defaults,
        "summary": f"Scenario '{scenario_tag}' is active for region {region}.",
        "key_events": [
            "Energy and supply conditions reflected via deterministic defaults",
            "Regional sensitivity adjustments applied",
            "Pricing strategy modifiers applied",
        ],
        "sources_used": ["deterministic_defaults"],
        "execution_mode": "deterministic_defaults",
    }


def customer_agent(state: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    price_pressure = state["price_index"] * state["price_sensitivity"]
    market_boost = state["demand_shift"] * (1 - state["consumer_stress"] * 0.3)
    competition_drag = state["competition"] * 0.25
    quality_boost = state["feature_score"] * 0.2

    formula_demand = clamp(0.5 + market_boost + quality_boost - price_pressure - competition_drag)

    # deterministic baseline delta
    llm_delta = clamp((0.5 - price_pressure) * 0.2 + (market_boost - 0.3) * 0.2, -0.3, 0.3)

    adk_output = _adk_runner.run_json_agent(
        name="customer_agent",
        instruction=(
            "You are a customer behavior agent. Return strict JSON with demand_adjustment,"
            " sentiment, price_verdict, and reasoning."
        ),
        prompt=(
            f"Region: {config['market']['region']}\n"
            f"Price index: {state['price_index']:.3f}\n"
            f"Price sensitivity: {state['price_sensitivity']:.3f}\n"
            f"Demand shift: {state['demand_shift']:.3f}\n"
            f"Competition: {state['competition']:.3f}\n"
            f"Feature score: {state['feature_score']:.3f}\n"
            f"Consumer stress: {state['consumer_stress']:.3f}\n"
            "Return a realistic demand adjustment in range [-0.3,0.3]."
        ),
        output_schema={
            "type": "object",
            "properties": {
                "demand_adjustment": {"type": "number"},
                "sentiment": {"type": "string"},
                "price_verdict": {"type": "string"},
                "reasoning": {"type": "string"},
            },
            "required": ["demand_adjustment", "sentiment", "price_verdict", "reasoning"],
        },
    )
    if adk_output and "demand_adjustment" in adk_output:
        llm_delta = clamp(float(adk_output["demand_adjustment"]), -0.3, 0.3)

    blended = clamp(0.6 * formula_demand + 0.4 * clamp(formula_demand + llm_delta))

    sentiment = "neutral"
    if blended >= 0.8:
        sentiment = "very_positive"
    elif blended >= 0.65:
        sentiment = "positive"
    elif blended < 0.35:
        sentiment = "negative"

    price_verdict = "fair"
    if price_pressure > 0.55:
        price_verdict = "too_expensive"
    elif price_pressure < 0.25:
        price_verdict = "good_value"

    reasoning = (
        f"Customers in {config['market']['region']} show {sentiment} reaction "
        "based on current stress, value, and market shift."
    )
    execution_mode = "deterministic"
    if adk_output:
        execution_mode = "adk"
        sentiment = str(adk_output.get("sentiment", sentiment)).lower()
        if sentiment not in {"very_positive", "positive", "neutral", "negative", "very_negative"}:
            sentiment = "neutral"
        price_verdict = str(adk_output.get("price_verdict", price_verdict)).lower()
        if price_verdict not in {"too_expensive", "fair", "good_value", "excellent_value"}:
            price_verdict = "fair"
        reasoning = str(adk_output.get("reasoning", reasoning)).strip() or reasoning

    return {
        "demand": blended,
        "sentiment": sentiment,
        "price_verdict": price_verdict,
        "reasoning": reasoning,
        "execution_mode": execution_mode,
    }


def competitor_agent(state: Dict[str, Any], config: Dict[str, Any], step: int) -> Dict[str, Any]:
    threat = state["demand"] * 0.6 + state["market_volatility"] * 0.4

    if threat > 0.75:
        strategy = "aggressive"
        competition_delta = 0.12
        price_cut_pct = 0.15
        action = "price_cut"
    elif threat > 0.50:
        strategy = "reactive"
        competition_delta = 0.09
        price_cut_pct = 0.08
        action = "price_cut"
    elif threat > 0.30:
        strategy = "monitoring"
        competition_delta = 0.04
        price_cut_pct = 0.0
        action = "marketing_push"
    else:
        strategy = "ignore"
        competition_delta = 0.01
        price_cut_pct = 0.0
        action = "none"

    if step == 1:
        competition_delta *= 0.6
    if step >= 3:
        competition_delta += 0.02
    if state["supply_disruption"] > 0.6:
        competition_delta *= 0.75

    adk_output = _adk_runner.run_json_agent(
        name="competitor_agent",
        instruction=(
            "You are a competitor strategy agent. Return strict JSON for strategy,"
            " competition_delta, price_adjustment_pct, action, reasoning."
        ),
        prompt=(
            f"Step: {step}\nDemand: {state['demand']:.3f}\nThreat: {threat:.3f}\n"
            f"Market volatility: {state['market_volatility']:.3f}\n"
            f"Supply disruption: {state['supply_disruption']:.3f}\n"
            "Return realistic competitive response."
        ),
        output_schema={
            "type": "object",
            "properties": {
                "strategy": {"type": "string"},
                "competition_delta": {"type": "number"},
                "price_adjustment_pct": {"type": "number"},
                "action": {"type": "string"},
                "reasoning": {"type": "string"},
            },
            "required": [
                "strategy",
                "competition_delta",
                "price_adjustment_pct",
                "action",
                "reasoning",
            ],
        },
    )
    if adk_output:
        strategy = str(adk_output.get("strategy", strategy)).lower()
        if strategy not in {"aggressive", "reactive", "monitoring", "ignore"}:
            strategy = "reactive"
        competition_delta = clamp(float(adk_output.get("competition_delta", competition_delta)), 0.0, 0.35)
        price_cut_pct = clamp(float(adk_output.get("price_adjustment_pct", price_cut_pct)), 0.0, 0.2)
        action = str(adk_output.get("action", action)).lower()
        if action not in {"price_cut", "feature_launch", "marketing_push", "none"}:
            action = "none"

    new_competition = clamp(state["competition"] + competition_delta)

    original_price = state["raw_price"]
    new_price = original_price * (1 - price_cut_pct)
    floor_price = config["product"]["raw_price"] * 0.4
    new_price = max(new_price, floor_price)

    competitor_reasoning = f"Threat {threat:.2f} triggered {strategy} response."
    execution_mode = "deterministic"
    if adk_output:
        execution_mode = "adk"
        competitor_reasoning = str(adk_output.get("reasoning", competitor_reasoning)).strip() or competitor_reasoning

    return {
        "strategy": strategy,
        "competition": new_competition,
        "raw_price": round(new_price, 2),
        "price_index": clamp(new_price / 10000.0),
        "competitor_action": action,
        "competitor_reasoning": competitor_reasoning,
        "execution_mode": execution_mode,
    }


def investor_agent(state: Dict[str, Any], step: int) -> Dict[str, Any]:
    growth_signal = state["demand"] * 0.6 + (1 - state["competition"]) * 0.4
    risk = state["competition"] * 0.35 + state["market_volatility"] * 0.35 + state["consumer_stress"] * 0.2
    profit_signal = clamp(state["price_index"] * 1.8 + (1 - state["competition"]) * 0.1)

    confidence = clamp(0.45 * growth_signal + 0.35 * profit_signal - 0.15 * risk)

    # deterministic baseline adjustments
    confidence = clamp(confidence + ((state["demand"] - 0.5) * 0.1))
    risk = clamp(risk + ((state["market_volatility"] - 0.5) * 0.05))

    adk_output = _adk_runner.run_json_agent(
        name="investor_agent",
        instruction=(
            "You are an investor evaluation agent. Return strict JSON with confidence_adjustment,"
            " risk_adjustment, verdict, risk_flags, reasoning."
        ),
        prompt=(
            f"Step: {step}\nDemand: {state['demand']:.3f}\nCompetition: {state['competition']:.3f}\n"
            f"Market volatility: {state['market_volatility']:.3f}\nConsumer stress: {state['consumer_stress']:.3f}\n"
            f"Current confidence: {confidence:.3f}\nCurrent risk: {risk:.3f}"
        ),
        output_schema={
            "type": "object",
            "properties": {
                "confidence_adjustment": {"type": "number"},
                "risk_adjustment": {"type": "number"},
                "verdict": {"type": "string"},
                "risk_flags": {"type": "array", "items": {"type": "string"}},
                "reasoning": {"type": "string"},
            },
            "required": [
                "confidence_adjustment",
                "risk_adjustment",
                "verdict",
                "risk_flags",
                "reasoning",
            ],
        },
    )
    if adk_output:
        confidence = clamp(confidence + clamp(float(adk_output.get("confidence_adjustment", 0.0)), -0.2, 0.2))
        risk = clamp(risk + clamp(float(adk_output.get("risk_adjustment", 0.0)), -0.1, 0.2))

    if confidence > 0.7:
        verdict = "buy"
    elif confidence > 0.5:
        verdict = "hold"
    else:
        verdict = "avoid"

    if verdict == "buy" and confidence < 0.4:
        verdict = "hold"

    risk_flags = []
    if state["competition"] > 0.65:
        risk_flags.append("Competition escalating")
    if risk > 0.6:
        risk_flags.append("Macro risk elevated")
    if step >= 3 and state["competition"] > 0.55:
        risk_flags.append("Window may narrow in late steps")

    reasoning = "Investor view combines growth signal, risk load, and pricing quality."
    execution_mode = "deterministic"
    if adk_output:
        execution_mode = "adk"
        verdict = str(adk_output.get("verdict", verdict)).lower()
        if verdict not in {"strong_buy", "buy", "hold", "sell", "avoid"}:
            verdict = "hold"
        rf = adk_output.get("risk_flags", risk_flags)
        if isinstance(rf, list):
            risk_flags = [str(x) for x in rf][:5]
        reasoning = str(adk_output.get("reasoning", reasoning)).strip() or reasoning

    return {
        "confidence": confidence,
        "risk": risk,
        "verdict": verdict,
        "risk_flags": risk_flags,
        "reasoning": reasoning,
        "execution_mode": execution_mode,
    }
