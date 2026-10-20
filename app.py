import os
from typing import Literal
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()
app = FastAPI(title="Aster API", version="0.1.0")

class PlanRequest(BaseModel):
    goal: str = Field(min_length=1, max_length=2000)
    memory_context: list[str] = Field(default_factory=list, max_length=30)
    autonomy: Literal["suggest_only"] = "suggest_only"

class PlanStep(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    rationale: str = Field(default="", max_length=500)
    requires_confirmation: bool = True

class PlanResponse(BaseModel):
    summary: str
    steps: list[PlanStep]
    safety_note: str

def check_auth(authorization: str | None):
    expected = os.getenv("ASTER_API_TOKEN")
    if not expected:
        raise HTTPException(status_code=503, detail="Server token is not configured.")
    if authorization != f"Bearer {expected}":
        raise HTTPException(status_code=401, detail="Unauthorized")

@app.get("/health")
def health():
    return {"ok": True, "service": "aster-api", "mode": "suggest_only"}

@app.post("/plan", response_model=PlanResponse)
def plan(req: PlanRequest, authorization: str | None = Header(default=None)):
    check_auth(authorization)
    # Safe offline baseline: this endpoint does not execute tools or call a model.
    # Add a provider adapter here after choosing a provider, with server-side secrets only.
    goal = req.goal.strip()
    return PlanResponse(
        summary=f"Proposed plan for: {goal}",
        steps=[
            PlanStep(title="Define the finish line", rationale="Make success observable."),
            PlanStep(title="Collect relevant information", rationale="Use the minimum necessary data."),
            PlanStep(title="Draft a reversible first action", rationale="Prepare an option without committing."),
            PlanStep(title="Ask the user to approve the next action", rationale="Keep consequential choices user-controlled."),
            PlanStep(title="Review the outcome and update the plan", rationale="Learn from the result.")
        ],
        safety_note="Suggest-only mode. No tools were executed. External, destructive, financial, or account actions require explicit user confirmation and separate reviewed integrations."
    )
