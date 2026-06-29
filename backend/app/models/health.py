from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class HealthScoreBase(BaseModel):
    caries_score: float = Field(default=40.0, ge=0, le=40)
    orthodontic_score: float = Field(default=30.0, ge=0, le=30)
    cancer_score: float = Field(default=30.0, ge=0, le=30)

class HealthScoreCreate(HealthScoreBase):
    patient_id: str

class HealthScoreResponse(HealthScoreBase):
    id: str = Field(alias="_id")
    patient_id: str
    total_score: float
    status: str # "Excellent", "Good", "Moderate", "Critical"
    created_at: datetime

    class Config:
        populate_by_name = True
