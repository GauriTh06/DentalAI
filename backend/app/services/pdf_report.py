import os
import base64
import tempfile
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_pdf_report(patient_name: str, patient_email: str, scan_data: dict, health_data: dict, dentist_notes: str = None) -> bytes:
    """
    Generates a professional clinical PDF report using ReportLab.
    Returns bytes of the PDF.
    """
    # Create temp files for images
    temp_files = []
    
    # Setup PDF document in memory
    fd, temp_pdf_path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    
    try:
        doc = SimpleDocTemplate(
            temp_pdf_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        
        styles = getSampleStyleSheet()
        
        # Define Custom Color Palette (Teal / Slate)
        primary_color = colors.HexColor("#0D9488")   # Teal 600
        secondary_color = colors.HexColor("#0F766E") # Teal 700
        neutral_dark = colors.HexColor("#1E293B")    # Slate 800
        neutral_light = colors.HexColor("#F8FAFC")   # Slate 50
        border_color = colors.HexColor("#CBD5E1")    # Slate 300
        
        # Custom styles
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=primary_color,
            spaceAfter=12
        )
        
        subtitle_style = ParagraphStyle(
            'DocSub',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor("#64748B"),
            spaceAfter=20
        )
        
        section_heading = ParagraphStyle(
            'SectionHead',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=secondary_color,
            spaceBefore=12,
            spaceAfter=6,
            keepWithNext=True
        )
        
        body_style = ParagraphStyle(
            'BodyTextCustom',
            parent=styles['Normal'],
            fontSize=10,
            textColor=neutral_dark,
            leading=14
        )
        
        bold_body_style = ParagraphStyle(
            'BoldBodyTextCustom',
            parent=body_style,
            fontName='Helvetica-Bold'
        )
        
        # Build story
        story = []
        
        # --- Header ---
        header_data = [
            [
                Paragraph("<b>DentalAI Pro</b>", title_style),
                Paragraph("AI-Powered Dental Diagnostic Report", ParagraphStyle('RightSub', parent=subtitle_style, alignment=2))
            ]
        ]
        header_table = Table(header_data, colWidths=[3.5*inch, 4*inch])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'BOTTOM'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ]))
        story.append(header_table)
        
        # Colored banner line
        story.append(Table([[""]], colWidths=[7.5*inch], rowHeights=[3], style=TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), primary_color),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 0),
        ])))
        story.append(Spacer(1, 15))
        
        # --- Patient & Document Info ---
        info_data = [
            [
                Paragraph("<b>Patient Name:</b>", body_style),
                Paragraph(patient_name, body_style),
                Paragraph("<b>Report ID:</b>", body_style),
                Paragraph(f"D-REP-{datetime.now().strftime('%Y%m%d')}-{abs(hash(patient_email)) % 10000:04d}", body_style)
            ],
            [
                Paragraph("<b>Patient Email:</b>", body_style),
                Paragraph(patient_email, body_style),
                Paragraph("<b>Date Generated:</b>", body_style),
                Paragraph(datetime.now().strftime("%B %d, %Y %I:%M %p"), body_style)
            ]
        ]
        info_table = Table(info_data, colWidths=[1.2*inch, 2.5*inch, 1.3*inch, 2.5*inch])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), neutral_light),
            ('BOX', (0,0), (-1,-1), 0.5, border_color),
            ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(info_table)
        story.append(Spacer(1, 15))
        
        # --- Composite Dental Health Index ---
        story.append(Paragraph("Composite Dental Health Index", section_heading))
        
        # Determine status color
        status = health_data.get("status", "Good")
        if status == "Excellent":
            status_color = colors.HexColor("#059669")
        elif status == "Good":
            status_color = colors.HexColor("#0D9488")
        elif status == "Moderate":
            status_color = colors.HexColor("#D97706")
        else:
            status_color = colors.HexColor("#DC2626")
            
        health_summary_data = [
            [
                Paragraph(f"<b>Overall Score:</b> {health_data.get('total_score', 80.0)}/100", bold_body_style),
                Paragraph(f"<b>Status:</b> <font color='{status_color.hexval()}'><b>{status}</b></font>", bold_body_style)
            ],
            [
                Paragraph(f"Caries Health Score: {health_data.get('caries_score', 40.0)}/40", body_style),
                Paragraph(f"Alignment Health Score: {health_data.get('orthodontic_score', 30.0)}/30", body_style)
            ],
            [
                Paragraph(f"Cancer Risk Health Score: {health_data.get('cancer_score', 30.0)}/30", body_style),
                Paragraph("", body_style)
            ]
        ]
        health_table = Table(health_summary_data, colWidths=[3.75*inch, 3.75*inch])
        health_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
            ('BOX', (0,0), (-1,-1), 0.5, border_color),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(health_table)
        story.append(Spacer(1, 15))
        
        # --- Diagnostic Results ---
        story.append(Paragraph("AI Diagnostic Summary", section_heading))
        
        pred_res = scan_data.get("prediction_result", {})
        scan_type = scan_data.get("scan_type", "caries").upper()
        
        results_data = [
            [Paragraph("<b>Scan Category</b>", bold_body_style), Paragraph(scan_type, body_style)],
            [Paragraph("<b>AI Finding</b>", bold_body_style), Paragraph(pred_res.get("label", "No Abnormalities"), body_style)],
            [Paragraph("<b>Confidence Score</b>", bold_body_style), Paragraph(f"{pred_res.get('confidence', 95.0)}%", body_style)],
            [Paragraph("<b>Severity / Risk Level</b>", bold_body_style), Paragraph(pred_res.get("severity", "Low"), body_style)],
        ]
        results_table = Table(results_data, colWidths=[2.5*inch, 5.0*inch])
        results_table.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 0.5, border_color),
            ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(results_table)
        story.append(Spacer(1, 15))
        
        # --- Side-by-Side Images (Original vs. Grad-CAM) ---
        heatmap_base64 = pred_res.get("heatmap_url", "")
        # Check if we have heatmap
        image_elements = []
        if heatmap_base64 and heatmap_base64.startswith("data:image"):
            try:
                # Extract base64 and save to temp file
                header, data = heatmap_base64.split(",", 1)
                img_data = base64.b64decode(data)
                
                # Write to temp image
                t_fd, temp_img_path = tempfile.mkstemp(suffix=".jpg")
                os.write(t_fd, img_data)
                os.close(t_fd)
                temp_files.append(temp_img_path)
                
                # Try inserting images
                # Wait, do we have original image? If not, we can use a placeholder,
                # or just render the Grad-CAM.
                # Let's see: original image_url might be a server path or URL.
                # If it's a local path on server (e.g. backend/uploads/xxx), we can load it.
                orig_img_path = scan_data.get("image_url", "")
                # Clean up path prefix if it has client prefix
                if orig_img_path.startswith("uploads/"):
                    orig_img_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), orig_img_path)
                
                image_row = []
                col_w = [3.6*inch, 3.6*inch]
                
                if os.path.exists(orig_img_path):
                    # Scale images to fit side-by-side
                    img1 = Image(orig_img_path, width=3.4*inch, height=2.5*inch)
                    image_row.append(img1)
                else:
                    image_row.append(Paragraph("Original Scan Image Not Available", body_style))
                
                img2 = Image(temp_img_path, width=3.4*inch, height=2.5*inch)
                image_row.append(img2)
                
                img_table_data = [
                    [Paragraph("<b>Original Clinical Scan</b>", bold_body_style), Paragraph("<b>Explainable AI (Grad-CAM Heatmap)</b>", bold_body_style)],
                    image_row
                ]
                img_table = Table(img_table_data, colWidths=col_w)
                img_table.setStyle(TableStyle([
                    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                    ('BOX', (0,0), (-1,-1), 0.5, border_color),
                    ('BACKGROUND', (0,0), (-1,0), neutral_light),
                ]))
                image_elements.append(img_table)
                image_elements.append(Spacer(1, 15))
            except Exception as img_err:
                logger.error(f"Failed to include images in PDF report: {img_err}")
                image_elements.append(Paragraph("<i>Scan visuals could not be loaded into the PDF document.</i>", body_style))
        
        if image_elements:
            story.append(KeepTogether(image_elements))
            
        # --- Recommendations ---
        rec_items = pred_res.get("recommendations", [])
        if rec_items:
            rec_elements = [Paragraph("AI-Generated Recommendations", section_heading)]
            bullet_data = []
            for item in rec_items:
                bullet_data.append([Paragraph("•", bold_body_style), Paragraph(item, body_style)])
            bullet_table = Table(bullet_data, colWidths=[0.2*inch, 7.3*inch])
            bullet_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ]))
            rec_elements.append(bullet_table)
            story.append(KeepTogether(rec_elements))
            story.append(Spacer(1, 15))
            
        # --- Dentist Remarks ---
        remarks = dentist_notes if dentist_notes else "Pending clinical review by attending dentist."
        remarks_elements = [
            Paragraph("Clinical Review & Remarks", section_heading),
            Paragraph(remarks, ParagraphStyle('RemarksText', parent=body_style, fontName='Helvetica-Oblique'))
        ]
        story.append(KeepTogether(remarks_elements))
        story.append(Spacer(1, 25))
        
        # --- Signature Blocks ---
        sig_data = [
            [
                Paragraph("___________________________________<br/><b>Authorized System Signature</b><br/>DentalAI Pro Diagnostic Engine", body_style),
                Paragraph("___________________________________<br/><b>Dentist Signature & Stamp</b><br/>Clinical Approver License No.", body_style)
            ]
        ]
        sig_table = Table(sig_data, colWidths=[3.75*inch, 3.75*inch])
        sig_table.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(KeepTogether([sig_table]))
        
        # Build document
        doc.build(story)
        
        # Read file bytes
        with open(temp_pdf_path, "rb") as f:
            pdf_bytes = f.read()
            
        return pdf_bytes
    finally:
        # Clean up temp files
        if os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)
        for tf_path in temp_files:
            if os.path.exists(tf_path):
                os.remove(tf_path)
