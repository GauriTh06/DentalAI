from fastapi import APIRouter, Depends, HTTPException, status, Response
from bson import ObjectId
from datetime import datetime
from typing import List
from backend.app.database import db_instance
from backend.app.auth import get_current_user
from backend.app.models.scan import ScanResponse
from backend.app.models.health import HealthScoreResponse
from backend.app.services.pdf_report import generate_pdf_report
from pydantic import BaseModel

router = APIRouter(prefix="/patient", tags=["Patient Portal"])

class ReportRequest(BaseModel):
    scan_id: str
    dentist_notes: str = None

def serialize_doc(doc) -> dict:
    if not doc:
        return None
    d = dict(doc)
    d["_id"] = str(d["_id"])
    d["patient_id"] = str(d.get("patient_id"))
    return d

@router.get("/history", response_model=List[ScanResponse])
async def get_patient_history(current_user: dict = Depends(get_current_user)):
    """
    Returns scan history for the logged in patient.
    """
    patient_id = ObjectId(current_user["_id"])
    cursor = db_instance.scans.find({"patient_id": patient_id}).sort("created_at", -1)
    scans = await cursor.to_list(length=100)
    return [serialize_doc(s) for s in scans]

@router.get("/health-trend", response_model=List[HealthScoreResponse])
async def get_health_trend(current_user: dict = Depends(get_current_user)):
    """
    Returns history of health index score updates.
    """
    patient_id = ObjectId(current_user["_id"])
    cursor = db_instance.health_scores.find({"patient_id": patient_id}).sort("created_at", 1)
    scores = await cursor.to_list(length=100)
    return [serialize_doc(s) for s in scores]

@router.post("/generate-report")
async def export_report(
    req: ReportRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generates a PDF diagnostic report for a specific scan.
    """
    # 1. Fetch scan
    try:
        scan_id = ObjectId(req.scan_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Scan ID")
        
    scan = await db_instance.scans.find_one({"_id": scan_id})
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
        
    # Check authorization (patient can only view their own, dentist/admin can view any)
    if current_user.get("role") == "patient" and str(scan.get("patient_id")) != str(current_user["_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this report."
        )
        
    # 2. Fetch patient profile details (if requested by dentist/admin, find patient info)
    patient = None
    if str(scan.get("patient_id")) == str(current_user["_id"]):
        patient = current_user
    else:
        patient = await db_instance.users.find_one({"_id": scan.get("patient_id")})
        
    if not patient:
        patient = {"name": "Unknown Patient", "email": "unknown@dentalai.com"}
        
    # 3. Fetch latest health index
    latest_health = await db_instance.health_scores.find_one(
        {"patient_id": scan.get("patient_id")},
        sort=[("created_at", -1)]
    )
    if not latest_health:
        latest_health = {
            "caries_score": 40.0,
            "orthodontic_score": 30.0,
            "cancer_score": 30.0,
            "total_score": 100.0,
            "status": "Excellent"
        }
        
    # 4. Generate report pdf bytes
    pdf_bytes = generate_pdf_report(
        patient_name=patient.get("name", "Patient"),
        patient_email=patient.get("email", "patient@email.com"),
        scan_data=scan,
        health_data=latest_health,
        dentist_notes=req.dentist_notes or scan.get("dentist_notes")
    )
    
    # 5. Return PDF stream
    filename = f"DentalAI_Report_{scan.get('scan_type')}_{scan_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
