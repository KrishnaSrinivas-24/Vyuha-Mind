from __future__ import annotations

from typing import Any, Dict, List

from app.utils import clamp


def _band(value: float, thresholds: List[float], labels: List[str]) -> str:
    for t, label in zip(thresholds, labels):
        if value <= t:
            return label
    return labels[-1]


def evaluate(final_state: Dict[str, Any], history: List[Dict[str, Any]]) -> Dict[str, Any]:
    demand = float(final_state.get("demand", 0.5))
    competition = float(final_state.get("competition", 0.5))
    confidence = float(final_state.get("confidence", 0.5))
    risk = float(final_state.get("risk", 0.5))
    market_volatility = float(final_state.get("market_volatility", 0.5))

    success_raw = 0.40 * demand + 0.30 * confidence - 0.20 * competition - 0.10 * risk
    volatility_penalty = market_volatility * 0.05
    success_raw -= volatility_penalty
    success_score = round(clamp(success_raw) * 100)

    if success_score >= 85:
        status = "HIGH_POTENTIAL"
    elif success_score >= 65:
        status = "MODERATE_POTENTIAL"
    elif success_score >= 45:
        status = "RISKY"
    else:
        status = "NOT_RECOMMENDED"

    breakdown = {
        "demand_health": _band(demand, [0.35, 0.65], ["Weak", "Moderate", "Strong"]),
        "competition_pressure": _band(
            competition,
            [0.25, 0.5, 0.75],
            ["Low", "Medium", "High", "Extreme"],
        ),
        "investor_confidence": _band(confidence, [0.4, 0.7], ["Low", "Moderate", "Strong"]),
        "market_risk": _band(risk, [0.35, 0.65], ["Low", "Moderate", "High"]),
    }

    if len(history) >= 2:
        d0 = history[0].get("demand", demand)
        d1 = history[-1].get("demand", demand)
        c0 = history[0].get("competition", competition)
        c1 = history[-1].get("competition", competition)
    else:
        d0 = d1 = demand
        c0 = c1 = competition

    demand_trend = "Stable"
    if d1 - d0 > 0.05:
        demand_trend = "Growing"
    elif d0 - d1 > 0.05:
        demand_trend = "Declining"

    competition_trend = "Stable"
    if c1 - c0 > 0.05:
        competition_trend = "Intensifying"
    elif c0 - c1 > 0.05:
        competition_trend = "Easing"

    summary = (
        "Strong consumer demand driven by market conditions creates real opportunity, "
        "but intensifying competition over time can compress margins."
    )
    if breakdown["demand_health"] == "Weak":
        summary = "Demand is currently weak; significant positioning or pricing changes are needed before scaling."
    elif breakdown["competition_pressure"] in {"High", "Extreme"}:
        summary = "Demand is present, but high competitive pressure reduces execution headroom and margin confidence."

    return {
        "success_score": success_score,
        "status": status,
        "breakdown": breakdown,
        "trends": {
            "demand_trend": demand_trend,
            "competition_trend": competition_trend,
        },
        "summary": summary,
    }
