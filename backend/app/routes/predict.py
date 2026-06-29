from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from fastapi.responses import JSONResponse
from datetime import datetime
import shutil
import uuid
import os
import json
from pathlib import Path
from bson import ObjectId
from enum import Enum
from backend.app.config import settings
from backend.app.database import db_instance
from backend.app.auth import get_current_user
from backend.app.services.ai_models import ai_models
from backend.app.models.scan import ScanResponse, ScanType
from backend.app.models.health import HealthScoreResponse

router = APIRouter(prefix="/predict", tags=["Prediction & Health Index"])


class SafeEncoder(json.JSONEncoder):
    """JSON encoder that handles ObjectId, datetime, Enum, etc."""
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, Enum):
            return obj.value
        # Catch any ObjectId-like type
        type_name = type(obj).__name__
        if 'ObjectId' in type_name or 'FakeObjectId' in type_name:
            return str(obj)
        return super().default(obj)


def serialize_doc(doc) -> dict:
    """Converts a document dict to a fully JSON-safe dict via round-trip encode/decode."""
    if not doc:
        return None
    raw = json.dumps(dict(doc), cls=SafeEncoder)
    return json.loads(raw)


async def calculate_and_save_health_index(patient_id: ObjectId) -> dict:
    """
    Calculates the composite health score for a patient based on their latest scans.
    Caries Health: Max 40 points
    Alignment Health: Max 30 points
    Cancer Risk Health: Max 30 points
    """
    # 1. Caries score (default 40.0)
    caries_score = 40.0
    latest_caries = await db_instance.scans.find_one(
        {"patient_id": patient_id, "scan_type": "caries"},
        sort=[("created_at", -1)]
    )
    if latest_caries:
        res = latest_caries.get("prediction_result", {})
        label = res.get("label", "").lower()
        severity = res.get("severity", "").lower()
        if "caries" in label or "decay" in label:
            if "mild" in severity:
                caries_score = 30.0
            elif "moderate" in severity:
                caries_score = 20.0
            elif "severe" in severity:
                caries_score = 10.0
            else:
                caries_score = 20.0 # Default fallback if caries
        else:
            caries_score = 40.0
            
    # 2. Alignment score (default 30.0)
    ortho_score = 30.0
    latest_ortho = await db_instance.scans.find_one(
        {"patient_id": patient_id, "scan_type": "orthodontic"},
        sort=[("created_at", -1)]
    )
    if latest_ortho:
        res = latest_ortho.get("prediction_result", {})
        label = res.get("label", "").lower()
        severity_val = res.get("severity_val", 0.0) # 0 to 100
        if "normal" not in label:
            # Deduct alignment health based on severity percentage (up to 20 deduction)
            ortho_score = 30.0 - (severity_val * 0.2)
            ortho_score = max(5.0, round(ortho_score, 1))
            
    # 3. Cancer risk score (default 30.0)
    cancer_score = 30.0
    latest_cancer = await db_instance.scans.find_one(
        {"patient_id": patient_id, "scan_type": "oral_cancer"},
        sort=[("created_at", -1)]
    )
    if latest_cancer:
        res = latest_cancer.get("prediction_result", {})
        severity = res.get("severity", "").lower()
        if "high" in severity:
            cancer_score = 5.0
        elif "moderate" in severity or "suspicious" in severity:
            cancer_score = 15.0
        else:
            cancer_score = 30.0

    total_score = round(caries_score + ortho_score + cancer_score, 1)
    
    # Categorize status
    if total_score >= 90:
        status_label = "Excellent"
    elif total_score >= 70:
        status_label = "Good"
    elif total_score >= 50:
        status_label = "Moderate"
    else:
        status_label = "Critical"
        
    health_score_doc = {
        "patient_id": patient_id,
        "caries_score": caries_score,
        "orthodontic_score": ortho_score,
        "cancer_score": cancer_score,
        "total_score": total_score,
        "status": status_label,
        "created_at": datetime.utcnow()
    }
    
    result = await db_instance.health_scores.insert_one(health_score_doc)
    health_score_doc["_id"] = result.inserted_id
    return health_score_doc

@router.post("/caries")
async def upload_caries_scan(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Create file paths
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"caries_{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Save uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Run AI analysis
    prediction = ai_models.predict_caries(file_path)
    
    # Save scan to database
    scan_doc = {
        "patient_id": ObjectId(current_user["_id"]),
        "scan_type": ScanType.CARIES,
        "image_url": f"uploads/{unique_filename}",
        "prediction_result": prediction,
        "dentist_notes": None,
        "dentist_reviewed": False,
        "created_at": datetime.utcnow()
    }
    
    result = await db_instance.scans.insert_one(scan_doc)
    scan_doc["_id"] = result.inserted_id
    
    # Recalculate health index
    await calculate_and_save_health_index(ObjectId(current_user["_id"]))
    
    return JSONResponse(content=serialize_doc(scan_doc))

@router.post("/orthodontic")
async def upload_ortho_scan(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"ortho_{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    prediction = ai_models.predict_orthodontic(file_path)
    
    scan_doc = {
        "patient_id": ObjectId(current_user["_id"]),
        "scan_type": ScanType.ORTHODONTIC,
        "image_url": f"uploads/{unique_filename}",
        "prediction_result": prediction,
        "dentist_notes": None,
        "dentist_reviewed": False,
        "created_at": datetime.utcnow()
    }
    
    result = await db_instance.scans.insert_one(scan_doc)
    scan_doc["_id"] = result.inserted_id
    
    await calculate_and_save_health_index(ObjectId(current_user["_id"]))
    
    return JSONResponse(content=serialize_doc(scan_doc))

@router.post("/oral_cancer")
async def upload_cancer_scan(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"cancer_{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    prediction = ai_models.predict_oral_cancer(file_path)
    
    scan_doc = {
        "patient_id": ObjectId(current_user["_id"]),
        "scan_type": ScanType.ORAL_CANCER,
        "image_url": f"uploads/{unique_filename}",
        "prediction_result": prediction,
        "dentist_notes": None,
        "dentist_reviewed": False,
        "created_at": datetime.utcnow()
    }
    
    result = await db_instance.scans.insert_one(scan_doc)
    scan_doc["_id"] = result.inserted_id
    
    await calculate_and_save_health_index(ObjectId(current_user["_id"]))
    
    return JSONResponse(content=serialize_doc(scan_doc))

@router.post("/generate-health-index")
async def force_generate_health_index(current_user: dict = Depends(get_current_user)):
    """
    Force triggers recalculation of the patient's dental health score.
    """
    health_score = await calculate_and_save_health_index(ObjectId(current_user["_id"]))
    return JSONResponse(content=serialize_doc(health_score))
