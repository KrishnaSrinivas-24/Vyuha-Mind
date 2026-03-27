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
        "regulatory_risk": 0.5,
        "tech_maturity": 0.4,
        "sentiment_hype": 0.3,
    },
    "lpg_crisis_2026": {
        "fuel_price_index": 0.95,
        "supply_disruption": 0.92,
        "demand_shift": 0.85,
        "market_volatility": 0.93,
        "price_sensitivity": 0.88,
        "market_pressure": 0.90,
        "consumer_stress": 0.87,
    },
    "stable_market": {
        "fuel_price_index": 0.5,
        "supply_disruption": 0.2,
        "demand_shift": 0.5,
        "market_volatility": 0.3,
        "price_sensitivity": 0.5,
        "market_pressure": 0.4,
        "consumer_stress": 0.3,
        "regulatory_risk": 0.1,
        "tech_maturity": 0.6,
        "sentiment_hype": 0.5,
    },
    "economic_growth": {
        "fuel_price_index": 0.5,
        "supply_disruption": 0.1,
        "demand_shift": 0.6,
        "market_volatility": 0.2,
        "price_sensitivity": 0.4,
        "market_pressure": 0.3,
        "consumer_stress": 0.2,
        "regulatory_risk": 0.05,
        "tech_maturity": 0.8,
        "sentiment_hype": 0.7,
    },
    "recession": {
        "fuel_price_index": 0.6,
        "supply_disruption": 0.5,
        "demand_shift": 0.3,
        "market_volatility": 0.7,
        "price_sensitivity": 0.9,
        "market_pressure": 0.8,
        "consumer_stress": 0.85,
        "regulatory_risk": 0.4,
        "tech_maturity": 0.3,
        "sentiment_hype": 0.1,
    },
    "geopolitical_crisis": {
        "fuel_price_index": 0.85,
        "supply_disruption": 0.8,
        "demand_shift": 0.6,
        "market_volatility": 0.9,
        "price_sensitivity": 0.75,
        "market_pressure": 0.85,
        "consumer_stress": 0.7,
        "regulatory_risk": 0.7,
        "tech_maturity": 0.4,
        "sentiment_hype": 0.2,
    },
    "supply_chain_disruption": {
        "fuel_price_index": 0.6,
        "supply_disruption": 0.9,
        "demand_shift": 0.5,
        "market_volatility": 0.7,
        "price_sensitivity": 0.7,
        "market_pressure": 0.7,
        "consumer_stress": 0.6,
        "regulatory_risk": 0.3,
        "tech_maturity": 0.4,
        "sentiment_hype": 0.3,
    },
}


# ── March 2026 South Asian LPG Crisis – Full scenario metadata ───────
LPG_CRISIS_2026: Dict[str, Any] = {
    "id": "lpg_crisis_2026",
    "name": "March 2026 South Asian LPG Crisis",
    "description": (
        "Triggered by escalating geopolitical conflict and the effective closure "
        "of the Strait of Hormuz, ~95% of Middle Eastern LPG supplies are halted. "
        "South Asian coastal regions face acute energy shortages with up to 85% "
        "import dependency."
    ),
    "trigger_date": "2026-03-01",
    "oil_price_surge_pct": 45,
    "gas_price_surge_pct": 55,
    "rationing": {
        "auto_lpg_cap_litres_per_day": 10,
        "standard_auto_rickshaw_tank_litres": 20,
        "commercial_supply_cut_pct": 35,
        "government_reserve_days": 74,
        "actual_stock_cover_days": 60,
    },
    "prices_inr": {
        "domestic_14_2kg_non_subsidized": 913,
        "commercial_19kg": 1883,
    },
    "affected_regions": ["IN", "LK", "BD", "PK"],
    "market_variables": SCENARIO_DEFAULTS["lpg_crisis_2026"],
}


# ── E10/E20 Fuel Transition Crisis – Scenario defaults ────────────────
SCENARIO_DEFAULTS["e10_e20_transition"] = {
    "fuel_price_index": 0.55,
    "supply_disruption": 0.30,
    "demand_shift": 0.75,
    "market_volatility": 0.60,
    "price_sensitivity": 0.72,
    "market_pressure": 0.65,
    "consumer_stress": 0.58,
}

E10_E20_TRANSITION: Dict[str, Any] = {
    "id": "e10_e20_transition",
    "name": "E10/E20 Fuel Transition Crisis for Legacy Vehicles",
    "description": (
        "India's rapid mandate to E20 fuel (20% ethanol blend) creates a mechanical "
        "crisis for 10-15 year-old vehicles. Ethanol absorbs moisture causing phase "
        "separation, corrodes brass/copper/zinc fuel components, and degrades rubber "
        "fuel lines and gaskets — posing extreme fire hazards in older cars."
    ),
    "trigger_date": "2025-04-01",
    "e20_blend_pct": 20,
    "affected_vehicle_age_years": "10-15+",
    "mechanical_risks": [
        "Phase separation (water-ethanol separation in fuel tank)",
        "Corrosion of brass, copper, lead, tin, zinc fuel components",
        "Rubber fuel line and gasket degradation",
        "Carburetor blockage and fuel pump failure",
        "Extreme fire hazard from perished fuel lines",
    ],
    "product_opportunities": [
        {
            "type": "chemical_additive",
            "name": "Etha-Guard Stabilizer",
            "price_inr": 499,
            "model": "recurring_subscription",
            "desc": "Neutralizes acidity, prevents phase separation",
        },
        {
            "type": "physical_kit",
            "name": "E20 Upgrade Kit (OEM)",
            "price_inr": 5000,
            "model": "one_time_purchase",
            "desc": "Replaces rubber seals, adds ethanol-resistant fuel lines",
        },
    ],
    "consumer_personas": [
        "Budget commuter (12-year-old hatchback, ₹15k/mo income)",
        "Classic car enthusiast (1990s sedan, high willingness to pay)",
        "Auto-rickshaw driver (daily livelihood depends on vehicle)",
        "Rural farmer (tractor + truck fleet, price-sensitive)",
    ],
    "competitor_oems": ["Maruti Suzuki", "Hyundai", "Tata Motors"],
    "affected_regions": ["IN"],
    "market_variables": SCENARIO_DEFAULTS["e10_e20_transition"],
}
