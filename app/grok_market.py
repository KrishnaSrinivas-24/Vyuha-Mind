from __future__ import annotations

import json
import os
from typing import Any, Dict, Optional

import httpx

from app.utils import clamp


def _extract_json(text: str) -> Optional[Dict[str, Any]]:
    raw = (text or "").strip()
    if not raw:
        return None

    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.lower().startswith("json"):
            raw = raw[4:].strip()

    try:
        parsed = json.loads(raw)
        return parsed if isinstance(parsed, dict) else None
    except json.JSONDecodeError:
        return None


def _grok_api_key() -> str:
    return os.getenv("GROK_API_KEY", "") or os.getenv("XAI_API_KEY", "")


def get_grok_market_analysis(config: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    api_key = _grok_api_key()
    if not api_key:
        return None

    scenario = config["market"]["raw_scenario"]
    product = config["product"]["name"]
    region = config["market"]["region"]
    scenario_tag = config["market"]["scenario_tag"]

    system_prompt = (
        "You are a real-time market intelligence agent. "
        "Return JSON only, no markdown, no prose outside JSON."
    )
    user_prompt = (
        f"Scenario: {scenario}\n"
        f"Scenario tag: {scenario_tag}\n"
        f"Product: {product}\n"
        f"Region: {region}\n\n"
        "Return strictly valid JSON with this exact shape:\n"
        "{\n"
        '  "fuel_price_index": <0.0-1.0>,\n'
        '  "supply_disruption": <0.0-1.0>,\n'
        '  "demand_shift": <0.0-1.0>,\n'
        '  "market_volatility": <0.0-1.0>,\n'
        '  "price_sensitivity": <0.0-1.0>,\n'
        '  "market_pressure": <0.0-1.0>,\n'
        '  "consumer_stress": <0.0-1.0>,\n'
        '  "summary": "<2 concise sentences>",\n'
        '  "key_events": ["<event1>", "<event2>", "<event3>"]\n'
        "}"
    )

    payload = {
        "model": os.getenv("GROK_MODEL", "grok-3-latest"),
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
    }

    try:
        with httpx.Client(timeout=20.0) as client:
            response = client.post(
                "https://api.x.ai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
    except Exception:
        return None

    try:
        content = data["choices"][0]["message"]["content"]
    except Exception:
        return None

    parsed = _extract_json(content)
    if not parsed:
        return None

    required_numeric = [
        "fuel_price_index",
        "supply_disruption",
        "demand_shift",
        "market_volatility",
        "price_sensitivity",
        "market_pressure",
        "consumer_stress",
    ]

    result: Dict[str, Any] = {}
    for key in required_numeric:
        try:
            result[key] = clamp(float(parsed[key]))
        except Exception:
            return None

    result["summary"] = str(parsed.get("summary", "")).strip() or "Grok market summary unavailable."
    key_events = parsed.get("key_events", [])
    if not isinstance(key_events, list):
        key_events = []
    result["key_events"] = [str(x) for x in key_events][:5]

    return result
