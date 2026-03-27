from __future__ import annotations

from typing import Any, Dict, List, Tuple

from app.utils import (
    audience_price_sensitivity,
    audience_type,
    feature_score,
    normalize_text,
    region_code,
)


SUPPORTED_SCENARIO_TAGS = {
    "energy_crisis",
    "supply_chain_disruption",
    "economic_growth",
    "recession",
    "geopolitical_crisis",
    "stable_market",
}


def _scenario_from_keywords(text: str) -> str:
    normalized = normalize_text(text)
    if any(token in normalized for token in ["lpg", "fuel", "gas", "energy"]):
        return "energy_crisis"
    if any(token in normalized for token in ["war", "conflict", "tension"]):
        return "geopolitical_crisis"
    if any(token in normalized for token in ["shortage", "supply", "disruption"]):
        return "supply_chain_disruption"
    if any(token in normalized for token in ["inflation", "prices rising"]):
        return "recession"
    if any(token in normalized for token in ["growth", "boom", "demand rising"]):
        return "economic_growth"
    return "stable_market"


def _embedding_like_match(text: str) -> Tuple[str, float]:
    normalized = normalize_text(text)
    scoring = {
        "energy_crisis": ["energy", "lpg", "fuel", "gas", "power"],
        "supply_chain_disruption": ["supply", "disruption", "shortage", "logistics"],
        "economic_growth": ["growth", "boom", "expansion"],
        "recession": ["recession", "downturn", "slump"],
        "trade_war": ["trade war", "tariff"],
        "stable_market": ["stable", "normal", "balanced"],
    }
    tag = "stable_market"
    best = 0.0
    for key, tokens in scoring.items():
        points = sum(1 for token in tokens if token in normalized)
        confidence = min(1.0, points / 2.0)
        if confidence > best:
            best = confidence
            tag = key
    return tag, best


def _canonical_scenario_tag(tag: str) -> str:
    alias_map = {
        "economic_pressure": "recession",
        "trade_war": "geopolitical_crisis",
    }
    normalized = alias_map.get(tag, tag)
    if normalized not in SUPPORTED_SCENARIO_TAGS:
        return "stable_market"
    return normalized


def build_config(raw_input: Dict[str, Any]) -> Dict[str, Any]:
    required = [
        "product_name",
        "product_description",
        "features",
        "price",
        "pricing_strategy",
        "target_audience",
        "market_scenario",
        "region",
    ]
    for field in required:
        if field not in raw_input:
            raise ValueError(f"missing_field:{field}")

    warnings: List[str] = []

    try:
        price = float(raw_input["price"])
    except (TypeError, ValueError) as exc:
        raise ValueError("invalid_value:price") from exc
    if price <= 0:
        raise ValueError("invalid_value:price")

    if not isinstance(raw_input.get("features"), list):
        raise ValueError("invalid_type:features")

    features = [normalize_text(str(x)) for x in raw_input.get("features", []) if str(x).strip()]
    normalized_region = region_code(str(raw_input["region"]))
    if normalized_region == "GLOBAL":
        warnings.append("unknown_region_defaulted_to_global")

    aud_type = audience_type(str(raw_input["target_audience"]))
    price_sens = audience_price_sensitivity(aud_type)
    if normalized_region == "IN":
        price_sens = min(1.0, price_sens + 0.05)

    strategy = normalize_text(str(raw_input["pricing_strategy"]))

    effective_price = price
    if strategy == "penetration":
        effective_price *= 0.9

    price_index = max(0.0, min(1.0, effective_price / 10000.0))

    scenario_text = str(raw_input["market_scenario"])
    scenario_tag, scenario_confidence = _embedding_like_match(scenario_text)
    if scenario_confidence < 0.65:
        scenario_tag = _scenario_from_keywords(scenario_text)
    scenario_tag = _canonical_scenario_tag(scenario_tag)

    feat_score = feature_score(features)
    if strategy == "premium":
        feat_score = min(1.0, feat_score + 0.1)

    config = {
        "product": {
            "name": normalize_text(str(raw_input["product_name"])),
            "description": normalize_text(str(raw_input["product_description"])),
            "features": features,
            "raw_price": price,
            "price_index": price_index,
            "pricing_strategy": strategy,
            "feature_score": feat_score,
        },
        "audience": {
            "type": aud_type,
            "raw_description": str(raw_input["target_audience"]),
            "price_sensitivity": price_sens,
        },
        "market": {
            "raw_scenario": scenario_text,
            "scenario_tag": scenario_tag,
            "scenario_confidence": round(scenario_confidence, 2),
            "region": normalized_region,
        },
        "warnings": warnings,
    }
    return config
