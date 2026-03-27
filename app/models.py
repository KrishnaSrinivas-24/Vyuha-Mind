from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


class SimulationInput(BaseModel):
    product_name: str
    product_description: str
    features: List[str]
    price: float
    pricing_strategy: str
    target_audience: str
    market_scenario: str
    region: str

    @field_validator("price")
    @classmethod
    def validate_price(cls, value: float) -> float:
        if value <= 0:
            raise ValueError("Price must be > 0")
        return value


class SimulateRequest(BaseModel):
    input: SimulationInput
    num_steps: int = Field(default=5, ge=1, le=120)


class RecommendRequest(BaseModel):
    config: Dict[str, Any]
    current_score: float
    current_state: Optional[Dict[str, Any]] = None
    market_context: Optional[Dict[str, Any]] = None
    num_steps: int = Field(default=5, ge=1, le=120)


class EngineStatus(BaseModel):
    status: str


class SimulateResponse(BaseModel):
    simulation_id: str
    steps_run: int
    history: List[Dict[str, Any]]
    agent_logs: List[Dict[str, Any]]
    market_context: Dict[str, Any]
    evaluation: Dict[str, Any]
    recommendation: Dict[str, Any]
    final_state: Dict[str, Any]
    warnings: List[str] = Field(default_factory=list)
    diagnostics: Dict[str, Any] = Field(default_factory=dict)


class PRDParseResponse(BaseModel):
    product_name: str
    product_description: str
    features: List[str]
    price: Optional[float] = None
    pricing_strategy: str = "competitive"
    target_audience: str = "middle_income"
    market_scenario: str
    region: str = "IN"
    extraction_confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    warnings: List[str] = Field(default_factory=list)
