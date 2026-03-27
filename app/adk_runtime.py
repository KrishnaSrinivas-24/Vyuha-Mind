from __future__ import annotations

import json
import os
from typing import Any, Dict, Optional
from uuid import uuid4
from app.key_manager import key_manager

ADK_AVAILABLE = False

try:
    from google.adk import Runner
    from google.adk.agents import LlmAgent
    from google.adk.sessions import InMemorySessionService
    from google.genai import types

    ADK_AVAILABLE = True
except Exception:
    ADK_AVAILABLE = False


def _as_bool(value: str) -> bool:
    return value.strip().lower() in {"1", "true", "yes", "y", "on"}


def adk_is_enabled() -> bool:
    if not ADK_AVAILABLE:
        return False
    if not _as_bool(os.getenv("ENABLE_ADK_AGENTS", "false")):
        return False
    return bool(os.getenv("GOOGLE_API_KEY"))


def _extract_json_text(text: str) -> Optional[Dict[str, Any]]:
    cleaned = text.strip()
    if not cleaned:
        return None
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].strip()
    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        return None
    return None


class AdkJsonAgentRunner:
    def __init__(self) -> None:
        self._enabled = adk_is_enabled()
        self._model = os.getenv("ADK_MODEL", "gemini-2.0-flash")
        self._app_name = "tcd-gcgc-simulator"
        self._session_service = InMemorySessionService() if self._enabled else None
        self._consecutive_failures = 0

    @property
    def enabled(self) -> bool:
        return self._enabled

    def run_json_agent(
        self,
        *,
        name: str,
        instruction: str,
        prompt: str,
        output_schema: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        if not self._enabled or not self._session_service:
            return None

        try:
            agent = LlmAgent(
                name=name,
                model=self._model,
                instruction=instruction,
                output_schema=output_schema,
                output_key="result",
            )
            runner = Runner(
                app_name=self._app_name,
                agent=agent,
                session_service=self._session_service,
            )

            user_id = "sim-user"
            session = self._session_service.create_session_sync(
                app_name=self._app_name,
                user_id=user_id,
                session_id=str(uuid4()),
            )
            message = types.Content(role="user", parts=[types.Part(text=prompt)])

            latest_text = ""
            for event in runner.run(user_id=user_id, session_id=session.id, new_message=message):
                state_delta = {}
                if getattr(event, "actions", None):
                    state_delta = getattr(event.actions, "state_delta", None) or getattr(
                        event.actions, "stateDelta", {}
                    )
                if isinstance(state_delta, dict) and "result" in state_delta:
                    result = state_delta["result"]
                    if isinstance(result, dict):
                        return result
                    if isinstance(result, str):
                        parsed = _extract_json_text(result)
                        if parsed is not None:
                            return parsed
                content = getattr(event, "content", None)
                if content and getattr(content, "parts", None):
                    for part in content.parts:
                        text = getattr(part, "text", None)
                        if text:
                            latest_text = text

            if latest_text:
                return _extract_json_text(latest_text)
            self._consecutive_failures = 0
            return None
        except Exception as exc:
            self._consecutive_failures += 1
            msg = str(exc).lower()
            if "resource_exhausted" in msg or "quota" in msg or "429" in msg:
                # Rotate key and stay enabled
                key_manager.rotate_key()
                print(f"⚠️ Quota hit in ADK. Rotated key. Prompt: {prompt[:50]}...")
            elif self._consecutive_failures >= 3:
                self._enabled = False
            return None
