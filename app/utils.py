from __future__ import annotations

from typing import Any, Dict, Iterable


def clamp(value: float, lower: float = 0.0, upper: float = 1.0) -> float:
    return max(lower, min(upper, value))


def safe_float(value: Any, default: float) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def normalize_text(value: str) -> str:
    return " ".join(value.strip().lower().split())


def feature_score(features: Iterable[str]) -> float:
    count = len(list(features))
    return clamp(count / 10.0)


def region_code(raw_region: str) -> str:
    value = normalize_text(raw_region)
    mapping = {
        "india": "IN",
        "in": "IN",
        "us": "US",
        "usa": "US",
        "united states": "US",
        "eu": "EU",
        "europe": "EU",
    }
    return mapping.get(value, "GLOBAL")


def audience_type(raw_audience: str) -> str:
    value = normalize_text(raw_audience)
    if any(token in value for token in ["budget", "low income", "low-income"]):
        return "budget"
    if any(token in value for token in ["middle", "middle class", "middle-class"]):
        return "middle_income"
    if any(token in value for token in ["premium", "luxury", "high income"]):
        return "premium"
    if "enterprise" in value or "business" in value:
        return "enterprise"
    return "middle_income"


def audience_price_sensitivity(aud_type: str) -> float:
    return {
        "budget": 0.9,
        "middle_income": 0.75,
        "premium": 0.4,
        "enterprise": 0.3,
    }.get(aud_type, 0.75)


SCENARIO_DEFAULTS: Dict[str, Dict[str, float]] = {
    "energy_crisis": {
        "fuel_price_index": 0.9,
        "supply_disruption": 0.7,
        "demand_shift": 0.8,
        "market_volatility": 0.8,
        "price_sensitivity": 0.8,
        "market_pressure": 0.75,
        "consumer_stress": 0.7,
    },
    "stable_market": {
        "fuel_price_index": 0.5,
        "supply_disruption": 0.2,
        "demand_shift": 0.5,
        "market_volatility": 0.3,
        "price_sensitivity": 0.5,
        "market_pressure": 0.4,
        "consumer_stress": 0.3,
    },
    "economic_growth": {
        "fuel_price_index": 0.5,
        "supply_disruption": 0.1,
        "demand_shift": 0.6,
        "market_volatility": 0.2,
        "price_sensitivity": 0.4,
        "market_pressure": 0.3,
        "consumer_stress": 0.2,
    },
    "recession": {
        "fuel_price_index": 0.6,
        "supply_disruption": 0.5,
        "demand_shift": 0.3,
        "market_volatility": 0.7,
        "price_sensitivity": 0.9,
        "market_pressure": 0.8,
        "consumer_stress": 0.85,
    },
    "geopolitical_crisis": {
        "fuel_price_index": 0.85,
        "supply_disruption": 0.8,
        "demand_shift": 0.6,
        "market_volatility": 0.9,
        "price_sensitivity": 0.75,
        "market_pressure": 0.85,
        "consumer_stress": 0.7,
    },
    "supply_chain_disruption": {
        "fuel_price_index": 0.6,
        "supply_disruption": 0.9,
        "demand_shift": 0.5,
        "market_volatility": 0.7,
        "price_sensitivity": 0.7,
        "market_pressure": 0.7,
        "consumer_stress": 0.6,
    },
}
