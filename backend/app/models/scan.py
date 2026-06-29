from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class ScanType(str, Enum):
    CARIES = "caries"
    ORTHODONTIC = "orthodontic"
    ORAL_CANCER = "oral_cancer"

class PredictionResult(BaseModel):
    label: str
    confidence: float
    severity: Optional[str] = None      # "Mild", "Moderate", "Severe", or severity percentage
    severity_val: Optional[float] = None # Numeric severity value (e.g. percentage or index)
    heatmap_url: Optional[str] = None   # Base64 or relative image path
    recommendations: List[str] = []

class ScanBase(BaseModel):
    scan_type: ScanType
    image_url: str

class ScanCreate(ScanBase):
    patient_id: str
    prediction_result: PredictionResult

class ScanResponse(BaseModel):
    id: str = Field(alias="_id")
    patient_id: str
    scan_type: ScanType
    image_url: str
    prediction_result: PredictionResult
    dentist_notes: Optional[str] = None
    dentist_reviewed: bool = False
    created_at: datetime

    class Config:
        populate_by_name = True
