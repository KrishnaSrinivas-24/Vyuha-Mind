from __future__ import annotations

from copy import deepcopy
from typing import Any, Dict, List, Optional

from app.evaluation import evaluate
from app.orchestrator import run_simulation_with_fixed_market
from app.utils import clamp, safe_float


def _normalize_recommend_config(
    config: Dict[str, Any],
    market_context_values: Dict[str, Any],
) -> Dict[str, Any]:
    cfg = deepcopy(config) if isinstance(config, dict) else {}

    product = cfg.get("product") if isinstance(cfg.get("product"), dict) else {}
    audience = cfg.get("audience") if isinstance(cfg.get("audience"), dict) else {}
    market = cfg.get("market") if isinstance(cfg.get("market"), dict) else {}

    raw_price = safe_float(product.get("raw_price", cfg.get("price", 1999)), 1999.0)
    if raw_price <= 0:
        raw_price = 1999.0

    price_index = clamp(safe_float(product.get("price_index", raw_price / 10000.0), raw_price / 10000.0))
    feature_score = clamp(safe_float(product.get("feature_score", market_context_values.get("feature_score", 0.5)), 0.5))
    price_sensitivity = clamp(
        safe_float(audience.get("price_sensitivity", market_context_values.get("price_sensitivity", 0.6)), 0.6)
    )

    normalized = {
        "product": {
            "name": str(product.get("name", cfg.get("product_name", "product"))).lower(),
            "description": str(product.get("description", cfg.get("product_description", ""))).lower(),
            "features": product.get("features", cfg.get("features", [])) or [],
            "raw_price": raw_price,
            "price_index": price_index,
            "pricing_strategy": str(product.get("pricing_strategy", cfg.get("pricing_strategy", "value-based"))).lower(),
            "feature_score": feature_score,
        },
        "audience": {
            "type": str(audience.get("type", "middle_income")),
            "raw_description": str(audience.get("raw_description", cfg.get("target_audience", "generic"))),
            "price_sensitivity": price_sensitivity,
        },
        "market": {
            "raw_scenario": str(market.get("raw_scenario", cfg.get("market_scenario", "stable market"))),
            "scenario_tag": str(market.get("scenario_tag", "stable_market")),
            "scenario_confidence": safe_float(market.get("scenario_confidence", 0.6), 0.6),
            "region": str(market.get("region", cfg.get("region", "GLOBAL"))),
        },
        "warnings": cfg.get("warnings", []),
    }

    return normalized


def recommend(
    config: Dict[str, Any],
    original_score: float,
    market_context_values: Dict[str, Any],
    market_context: Optional[Dict[str, Any]] = None,
    trends: Optional[Dict[str, Any]] = None,
    num_steps: int = 5,
) -> Dict[str, Any]:
    config = _normalize_recommend_config(config, market_context_values)
    base_price = float(config["product"]["raw_price"])
    variants = [
        (base_price * 0.8, "-20%"),
        (base_price * 0.9, "-10%"),
        (base_price, "Original"),
        (base_price * 1.1, "+10%"),
    ]

    warnings: List[str] = []
    results: List[Dict[str, Any]] = []
    for price, label in variants:
        try:
            cfg = deepcopy(config)
            cfg["product"]["raw_price"] = round(price, 2)
            cfg["product"]["price_index"] = min(1.0, max(0.0, price / 10000.0))
            state, history = run_simulation_with_fixed_market(cfg, market_context_values, num_steps)
            score = evaluate(state, history)["success_score"]
            results.append(
                {
                    "price": round(price, 2),
                    "score": score,
                    "label": label,
                    "final_state": state,
                }
            )
        except Exception:
            warnings.append(f"simulation_fail_on_variant:{label}")

    if not results:
        return {
            "original_score": original_score,
            "best_price": round(base_price, 2),
            "best_score": original_score,
            "score_improvement": 0,
            "recommendation_type": "stay_the_course",
            "strategic_advice": "Consider the scoring data above to make your pricing decision.",
            "comparison_table": [],
            "warnings": warnings + ["all_variants_fail"],
        }

    best = sorted(results, key=lambda x: (x["score"], x["price"]), reverse=True)[0]
    if int(best["score"] - original_score) < 3:
        best = {
            "price": round(base_price, 2),
            "score": int(original_score),
            "label": "Original",
            "final_state": None,
        }
    score_improvement = int(best["score"] - original_score)

    if score_improvement < 3:
        advice = "Stay with current pricing and monitor competition weekly before any major move."
        recommendation_type = "stay_the_course"
    elif best["price"] < base_price:
        advice = (
            f"Reduce price toward {best['price']} now to convert current demand shift quickly "
            "before competitive pressure intensifies."
        )
        recommendation_type = "price_reduction"
    elif best["price"] > base_price:
        advice = (
            f"A premium at {best['price']} appears viable in this market window; "
            "protect margin while demand remains resilient."
        )
        recommendation_type = "price_increase"
    else:
        advice = "Current pricing is near-optimal for this scenario."
        recommendation_type = "maintain_price"

    # Deterministic strategist-style insight fallback (2-3 sentences).
    m_summary = (market_context or {}).get("summary", "Current market conditions are mixed.")
    d_trend = (trends or {}).get("demand_trend", "Stable")
    c_trend = (trends or {}).get("competition_trend", "Stable")
    contextual_advice = (
        f"{advice} Market context: {m_summary} "
        f"Demand trend is {d_trend} while competition is {c_trend}."
    )

    comparison_table = []
    for row in results:
        label = row["label"]
        if row["price"] == best["price"] and row["score"] == best["score"]:
            label = f"{label} BEST"
        comparison_table.append({"price": row["price"], "score": row["score"], "label": label})

    if not any("BEST" in row["label"] for row in comparison_table):
        for row in comparison_table:
            if row["label"] == "Original":
                row["label"] = "Original BEST"
                break

    return {
        "original_score": original_score,
        "best_price": best["price"],
        "best_score": best["score"],
        "score_improvement": score_improvement,
        "recommendation_type": recommendation_type,
        "strategic_advice": contextual_advice,
        "comparison_table": comparison_table,
        "warnings": warnings,
    }
