from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, TimeoutError
from copy import deepcopy
from typing import Any, Callable, Dict, List, Optional, Tuple

from app.agents import competitor_agent, customer_agent, investor_agent, market_analysis_agent

AGENT_TIMEOUT_SECONDS = 12.0
CONVERGENCE_DELTA_THRESHOLD = 0.01
CONVERGENCE_STREAK_REQUIRED = 2


def _run_with_timeout(fn: Callable[..., Dict[str, Any]], *args: Any) -> Dict[str, Any]:
    executor = ThreadPoolExecutor(max_workers=1)
    future = executor.submit(fn, *args)
    try:
        return future.result(timeout=AGENT_TIMEOUT_SECONDS)
    except TimeoutError:
        future.cancel()
        raise
    finally:
        # Do not block on shutdown if a worker is still executing after timeout.
        executor.shutdown(wait=False, cancel_futures=True)


def _safe_agent_call(
    *,
    agent_name: str,
    fn: Callable[..., Dict[str, Any]],
    required_keys: List[str],
    args: Tuple[Any, ...],
) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    try:
        output = _run_with_timeout(fn, *args)
    except TimeoutError:
        return None, f"agent_timeout:{agent_name}"
    except Exception:
        return None, f"agent_fail:{agent_name}"

    if not isinstance(output, dict):
        return None, f"llm_parse_fail:{agent_name}"

    for key in required_keys:
        if key not in output:
            return None, f"llm_parse_fail:{agent_name}"

    return output, None


def initialize_state(config: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "raw_price": config["product"]["raw_price"],
        "price_index": config["product"]["price_index"],
        "demand": 0.5,
        "competition": 0.35,
        "confidence": 0.5,
        "risk": 0.3,
        "market_pressure": 0.0,
        "fuel_price_index": 0.0,
        "supply_disruption": 0.0,
        "demand_shift": 0.0,
        "market_volatility": 0.0,
        "price_sensitivity": config["audience"]["price_sensitivity"],
        "consumer_stress": 0.0,
        "feature_score": config["product"]["feature_score"],
        "step": 0,
        "customer_history": [],
        "competitor_history": [],
        "investor_history": [],
    }


def run_simulation(config: Dict[str, Any], num_steps: int = 5) -> Dict[str, Any]:
    state = initialize_state(config)
    history: List[Dict[str, Any]] = []
    agent_logs: List[Dict[str, Any]] = []
    step_diagnostics: List[Dict[str, Any]] = []
    warnings: List[str] = []
    error_counter = 0
    convergence_triggered = False
    convergence_step: Optional[int] = None
    demand_stability_streak = 0
    previous_demand = float(state["demand"])

    try:
        market = _run_with_timeout(market_analysis_agent, config)
        if not isinstance(market, dict):
            raise ValueError("invalid_market_output")
    except Exception:
        market = {
            "fuel_price_index": 0.5,
            "supply_disruption": 0.5,
            "demand_shift": 0.5,
            "market_volatility": 0.5,
            "price_sensitivity": state["price_sensitivity"],
            "market_pressure": 0.5,
            "consumer_stress": 0.5,
            "summary": "Fallback market context was used.",
            "key_events": ["Market agent fallback"],
            "sources_used": ["market_agent_fallback"],
        }
        warnings.append("market_agent_fail_fallback_used")

    state.update(
        {
            k: v
            for k, v in market.items()
            if k
            not in [
                "summary",
                "key_events",
                "sources_used",
            ]
        }
    )

    try:
        for step in range(1, num_steps + 1):
            state["step"] = step

            c_out, c_err = _safe_agent_call(
                agent_name="customer",
                fn=customer_agent,
                required_keys=["demand", "sentiment", "reasoning"],
                args=(state, config),
            )
            if c_err:
                warnings.append(c_err)
                error_counter += 1
                c_out = {
                    "demand": state["demand"],
                    "sentiment": "neutral",
                    "price_verdict": "fair",
                    "reasoning": "Customer update skipped due to agent failure; previous state preserved.",
                }

            state["demand"] = float(c_out["demand"])
            state["customer_history"].append(
                {
                    "step": step,
                    "demand": state["demand"],
                    "sentiment": c_out.get("sentiment", "neutral"),
                    "reasoning": c_out.get("reasoning", ""),
                }
            )

            comp_out, comp_err = _safe_agent_call(
                agent_name="competitor",
                fn=competitor_agent,
                required_keys=["strategy", "competition", "raw_price", "price_index", "competitor_action"],
                args=(state, config, step),
            )
            if comp_err:
                warnings.append(comp_err)
                error_counter += 1
                comp_out = {
                    "strategy": "monitoring",
                    "competition": state["competition"],
                    "raw_price": state["raw_price"],
                    "price_index": state["price_index"],
                    "competitor_action": "none",
                    "competitor_reasoning": "Competitor update skipped due to agent failure; previous state preserved.",
                }

            state["competition"] = float(comp_out["competition"])
            state["raw_price"] = float(comp_out["raw_price"])
            state["price_index"] = float(comp_out["price_index"])
            state["competitor_history"].append(
                {
                    "step": step,
                    "strategy": comp_out.get("strategy", "monitoring"),
                    "action": comp_out.get("competitor_action", "none"),
                    "competition": state["competition"],
                    "price": state["raw_price"],
                    "reasoning": comp_out.get("competitor_reasoning", ""),
                }
            )

            inv_out, inv_err = _safe_agent_call(
                agent_name="investor",
                fn=investor_agent,
                required_keys=["confidence", "risk", "verdict", "risk_flags", "reasoning"],
                args=(state, step),
            )
            if inv_err:
                warnings.append(inv_err)
                error_counter += 1
                inv_out = {
                    "confidence": state["confidence"],
                    "risk": state["risk"],
                    "verdict": "hold",
                    "risk_flags": ["Investor update skipped due to agent failure"],
                    "reasoning": "Investor update skipped due to agent failure; previous state preserved.",
                }

            state["confidence"] = float(inv_out["confidence"])
            state["risk"] = float(inv_out["risk"])
            state["investor_history"].append(
                {
                    "step": step,
                    "confidence": state["confidence"],
                    "risk": state["risk"],
                    "verdict": inv_out.get("verdict", "hold"),
                    "risk_flags": inv_out.get("risk_flags", []),
                    "reasoning": inv_out.get("reasoning", ""),
                }
            )

            demand_delta = abs(float(state["demand"]) - previous_demand)
            if demand_delta < CONVERGENCE_DELTA_THRESHOLD:
                demand_stability_streak += 1
            else:
                demand_stability_streak = 0
            previous_demand = float(state["demand"])

            history.append(deepcopy(state))
            agent_logs.append(
                {
                    "step": step,
                    "customer": {
                        "reasoning": c_out.get("reasoning", ""),
                        "sentiment": c_out.get("sentiment", "neutral"),
                        "execution_mode": c_out.get("execution_mode", "deterministic"),
                        "error": c_err,
                    },
                    "competitor": {
                        "strategy": comp_out.get("strategy", "monitoring"),
                        "action": comp_out.get("competitor_action", "none"),
                        "execution_mode": comp_out.get("execution_mode", "deterministic"),
                        "error": comp_err,
                    },
                    "investor": {
                        "verdict": inv_out.get("verdict", "hold"),
                        "risk_flag": len(inv_out.get("risk_flags", [])) > 0,
                        "execution_mode": inv_out.get("execution_mode", "deterministic"),
                        "error": inv_err,
                    },
                }
            )

            step_diagnostics.append(
                {
                    "step": step,
                    "customer": {
                        "execution_mode": c_out.get("execution_mode", "deterministic"),
                        "fallback_reason": c_err,
                    },
                    "competitor": {
                        "execution_mode": comp_out.get("execution_mode", "deterministic"),
                        "fallback_reason": comp_err,
                    },
                    "investor": {
                        "execution_mode": inv_out.get("execution_mode", "deterministic"),
                        "fallback_reason": inv_err,
                    },
                    "demand_delta": round(demand_delta, 6),
                    "demand_stability_streak": demand_stability_streak,
                }
            )

            if demand_stability_streak >= CONVERGENCE_STREAK_REQUIRED:
                convergence_triggered = True
                convergence_step = step
                warnings.append(f"convergence_early_stop:step_{step}")
                break

    except Exception:
        warnings.append("loop_exception:partial_history_returned")

    if error_counter:
        warnings.append(f"agent_error_count:{error_counter}")

    return {
        "history": history,
        "agent_logs": agent_logs,
        "market_context": {
            "summary": market.get("summary", "Market summary unavailable."),
            "key_events": market.get("key_events", []),
            "sources_used": market.get("sources_used", []),
            "execution_mode": market.get("execution_mode", "unknown"),
        },
        "final_state": state,
        "warnings": warnings,
        "diagnostics": {
            "market_execution_mode": market.get("execution_mode", "unknown"),
            "agent_error_count": error_counter,
            "convergence_triggered": convergence_triggered,
            "convergence_step": convergence_step,
            "step_agent_modes": step_diagnostics,
        },
    }


def run_simulation_with_fixed_market(
    config: Dict[str, Any],
    market_context_values: Dict[str, Any],
    num_steps: int,
) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    state = initialize_state(config)
    history: List[Dict[str, Any]] = []
    state.update(market_context_values)

    for step in range(1, num_steps + 1):
        state["step"] = step

        c_out, _ = _safe_agent_call(
            agent_name="customer",
            fn=customer_agent,
            required_keys=["demand", "sentiment", "reasoning"],
            args=(state, config),
        )
        if c_out:
            state["demand"] = float(c_out["demand"])

        comp_out, _ = _safe_agent_call(
            agent_name="competitor",
            fn=competitor_agent,
            required_keys=["strategy", "competition", "raw_price", "price_index", "competitor_action"],
            args=(state, config, step),
        )
        if comp_out:
            state["competition"] = float(comp_out["competition"])
            state["raw_price"] = float(comp_out["raw_price"])
            state["price_index"] = float(comp_out["price_index"])

        inv_out, _ = _safe_agent_call(
            agent_name="investor",
            fn=investor_agent,
            required_keys=["confidence", "risk", "verdict", "risk_flags", "reasoning"],
            args=(state, step),
        )
        if inv_out:
            state["confidence"] = float(inv_out["confidence"])
            state["risk"] = float(inv_out["risk"])

        history.append(deepcopy(state))

    return state, history
