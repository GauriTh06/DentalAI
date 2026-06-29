from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime
from backend.app.database import db_instance
from backend.app.auth import get_current_user
import re

router = APIRouter(prefix="/chat", tags=["Oral Health Assistant"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    timestamp: datetime

@router.post("", response_model=ChatResponse)
async def chat_assistant(req: ChatRequest, current_user: dict = Depends(get_current_user)):
    user_id = ObjectId(current_user["_id"])
    msg = req.message.lower().strip()
    
    # 1. Fetch latest scan and latest health score for personalization
    latest_scan = await db_instance.scans.find_one(
        {"patient_id": user_id},
        sort=[("created_at", -1)]
    )
    latest_health = await db_instance.health_scores.find_one(
        {"patient_id": user_id},
        sort=[("created_at", -1)]
    )
    
    # Helper variables
    has_scans = latest_scan is not None
    scan_type = latest_scan.get("scan_type") if latest_scan else "None"
    scan_label = latest_scan.get("prediction_result", {}).get("label") if latest_scan else "None"
    scan_severity = latest_scan.get("prediction_result", {}).get("severity") if latest_scan else "None"
    
    health_score = latest_health.get("total_score") if latest_health else 100.0
    health_status = latest_health.get("status") if latest_health else "Excellent"
    
    # 2. Match intents
    # A. Check for greetings
    if any(greet in msg for greet in ["hello", "hi", "hey", "greetings"]):
        response = (
            f"Hello {current_user['name']}! I am your AI Oral Health Assistant. "
            "How can I help you today? You can ask me about your recent diagnosis, "
            "your Dental Health Index, or general oral hygiene practices."
        )
        
    # B. Explain my recent diagnosis
    elif any(k in msg for k in ["my scan", "my result", "my diagnosis", "recent diagnosis", "what did you find", "explain my result"]):
        if has_scans:
            response = (
                f"Your most recent scan was an <b>{scan_type.upper()}</b> scan uploaded on "
                f"{latest_scan['created_at'].strftime('%b %d, %Y')}.<br/><br/>"
                f"<b>AI Findings:</b> {scan_label}<br/>"
                f"<b>Severity/Risk Level:</b> {scan_severity}<br/>"
                f"<b>Confidence:</b> {latest_scan.get('prediction_result', {}).get('confidence', 0)}%<br/><br/>"
                f"<b>Recommendations:</b><br/>" + 
                "<br/>".join([f"- {r}" for r in latest_scan.get('prediction_result', {}).get('recommendations', [])])
            )
            if latest_scan.get("dentist_reviewed"):
                response += f"<br/><br/><b>Dentist Remarks:</b> {latest_scan.get('dentist_notes')}"
            else:
                response += "<br/><br/><i>Note: This scan is currently awaiting official clinical validation by our dentists.</i>"
        else:
            response = (
                "You haven't uploaded any dental scans yet. Please navigate to the "
                "<b>Upload & Diagnose</b> page to run an AI screening for caries, "
                "orthodontics, or oral cancer risk!"
            )
            
    # C. Explain my health score
    elif any(k in msg for k in ["health score", "health index", "my score", "dental health index", "overall health"]):
        if latest_health:
            response = (
                f"Your current <b>Composite Dental Health Index</b> is <b>{health_score}/100</b>, "
                f"which is classified as <b>{health_status}</b>.<br/><br/>"
                f"<b>Category breakdown:</b><br/>"
                f"- Caries Health: {latest_health.get('caries_score')}/40<br/>"
                f"- Alignment Health: {latest_health.get('orthodontic_score')}/30<br/>"
                f"- Cancer Risk Health: {latest_health.get('cancer_score')}/30<br/><br/>"
                "To improve your score, address any moderate/critical conditions flagged in your scans, "
                "keep up with routine cleanings, and follow personalized AI and dentist recommendations."
            )
        else:
            response = (
                "We don't have a computed health score for you yet. Once you complete your first "
                "dental upload, your Dental Health Index will automatically compile."
            )
            
    # D. General Cavities / Caries information
    elif any(k in msg for k in ["cavity", "cavities", "caries", "tooth decay", "decay"]):
        response = (
            "<b>Dental Caries (Cavities)</b> are permanently damaged areas in the hard surface of your teeth "
            "that develop into tiny openings or holes. They are caused by a combination of factors, including "
            "bacteria in your mouth, frequent snacking, sipping sugary drinks, and not cleaning your teeth well.<br/><br/>"
            "<b>Prevention Tips:</b><br/>"
            "- Brush with fluoride toothpaste twice a day.<br/>"
            "- Floss daily to clean food particles between teeth.<br/>"
            "- Visit your dentist regularly for professional cleanings.<br/>"
            "- Consider dental sealants for deep groove protection."
        )
        
    # E. General Orthodontic alignment information
    elif any(k in msg for k in ["brace", "braces", "aligner", "orthodontic", "overbite", "underbite", "crowding", "spacing"]):
        response = (
            "<b>Orthodontic conditions</b> refer to misalignments of the teeth and jaws, such as overbites, underbites, "
            "crowding, and spacing. Misaligned teeth can make cleaning difficult, leading to caries and gum disease, "
            "and can affect chewing and jaw alignment.<br/><br/>"
            "<b>Treatment Options:</b><br/>"
            "- <b>Traditional Braces:</b> Metal or ceramic brackets glued to teeth, connected by wires.<br/>"
            "- <b>Clear Aligner Therapy (e.g., Invisalign):</b> Custom, removable plastic trays that gradually shift teeth.<br/>"
            "- <b>Retainers:</b> Used post-treatment to hold teeth in their new positions."
        )
        
    # F. General Oral Cancer information
    elif any(k in msg for k in ["cancer", "lesion", "lesions", "tumor", "suspicious"]):
        response = (
            "<b>Oral Cancer</b> can develop in any part of the mouth, including the lips, gums, tongue, inside of the cheeks, "
            "roof of the mouth, and floor of the mouth. Early detection is vital for successful treatment.<br/><br/>"
            "<b>Symptoms to monitor:</b><br/>"
            "- A sore on your lip or mouth that doesn't heal.<br/>"
            "- A white or reddish patch on the inside of your mouth.<br/>"
            "- Loose teeth or growth/lump inside the mouth.<br/>"
            "- Persistent mouth or ear pain.<br/><br/>"
            "<i>Warning: If our system or your dentist flags a 'Suspicious' or 'Cancer Risk' area, please arrange "
            "a clinical visual examination and biopsy with an oral surgeon immediately.</i>"
        )
        
    # G. Fallback
    else:
        response = (
            "I'm sorry, I didn't quite catch that. As your Oral Health Assistant, I can answer questions about:<br/>"
            "- <b>My recent diagnosis</b>: Explains details of your latest scan.<br/>"
            "- <b>My health score</b>: Breaks down your Dental Health Index.<br/>"
            "- <b>General conditions</b>: Cavities/caries, orthodontic misalignments (braces, aligners), and oral cancer risks."
        )
        
    # Log the interaction (optional, but good for tracking)
    chat_doc = {
        "user_id": user_id,
        "message": req.message,
        "response": response,
        "created_at": datetime.utcnow()
    }
    await db_instance.chat_history.insert_one(chat_doc)
    
    return ChatResponse(response=response, timestamp=datetime.utcnow())
