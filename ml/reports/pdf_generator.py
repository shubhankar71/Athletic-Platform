import os
import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, Image
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_pdf_report(analysis_results, output_pdf_path):
    """
    Generates a professional PDF report from the ML analysis result dictionary,
    embedding Matplotlib & Seaborn visualization charts and video references.
    """
    os.makedirs(os.path.dirname(os.path.abspath(output_pdf_path)), exist_ok=True)
    
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette
    PRIMARY = colors.HexColor("#0D1B2A")    # Dark Navy
    SECONDARY = colors.HexColor("#1B263B")  # Slate Blue
    ACCENT = colors.HexColor("#00B4D8")     # Vibrant Cyan/Teal
    DARK_TEXT = colors.HexColor("#2B2D42")  # Dark Charcoal
    LIGHT_BG = colors.HexColor("#F8F9FA")   # Off-White
    BORDER = colors.HexColor("#E0E0E0")     # Light Grey
    ACCENT_GREEN = colors.HexColor("#2E7D32")
    ACCENT_CORAL = colors.HexColor("#D32F2F")

    # Typography Custom Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#6C757D"),
        spaceAfter=15
    )

    h2_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=SECONDARY,
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=DARK_TEXT
    )

    story = []

    # 1. Header
    story.append(Paragraph("CRICKET TECHNIQUE ANALYSIS REPORT", title_style))
    now_str = datetime.datetime.now().strftime("%B %d, %Y - %I:%M %p")
    story.append(Paragraph(f"Generated on {now_str} | Antigravity Sports ML Engine v2.0", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=ACCENT, spaceAfter=15))

    # Data Extraction
    pred = analysis_results.get("prediction", {})
    scores = analysis_results.get("scores", {})
    body = analysis_results.get("body_analysis", {})
    feedback = analysis_results.get("feedback", [])
    coaching = analysis_results.get("coaching_text", "")
    meta = analysis_results.get("video_metadata", {})
    visualizations = analysis_results.get("visualizations", {})

    stroke = pred.get("stroke", "Unknown")
    confidence = pred.get("confidence", 0.0) * 100
    overall_score = scores.get("overall", 0.0)

    # 2. Executive Summary Block (2-column key summary)
    summary_data = [
        [
            Paragraph(f"<b>PREDICTED STROKE:</b><br/><font size=16 color='{PRIMARY.hexval()}'><b>{stroke}</b></font><br/>Confidence: {confidence:.1f}%", body_style),
            Paragraph(f"<b>OVERALL TECHNIQUE SCORE:</b><br/><font size=16 color='{ACCENT.hexval()}'><b>{overall_score:.1f} / 100</b></font><br/>Based on 9 Biomechanical Metrics", body_style)
        ]
    ]
    summary_table = Table(summary_data, colWidths=[3.6 * inch, 3.6 * inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER),
        ('PADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 15))

    # 3. Video Metadata
    story.append(Paragraph("Video Information", h2_style))
    meta_text = (
        f"<b>Filename:</b> {meta.get('filename', 'N/A')} &nbsp;&nbsp;|&nbsp;&nbsp; "
        f"<b>Resolution:</b> {meta.get('resolution', 'N/A')} &nbsp;&nbsp;|&nbsp;&nbsp; "
        f"<b>FPS:</b> {meta.get('fps', 0):.1f} &nbsp;&nbsp;|&nbsp;&nbsp; "
        f"<b>Total Frames:</b> {meta.get('total_frames', 0)} &nbsp;&nbsp;|&nbsp;&nbsp; "
        f"<b>Pose Detection Rate:</b> {meta.get('detection_rate', 0.0)*100:.1f}%"
    )
    story.append(Paragraph(meta_text, body_style))
    story.append(Spacer(1, 12))

    # 4. Stroke Classification Probabilities & Technical Scores
    story.append(Paragraph("Stroke Classification & Technical Scores Breakdown", h2_style))
    
    conf_breakdown = pred.get("confidence_breakdown", {})
    prob_rows = [["Stroke Class", "Probability"]]
    for s_name, s_prob in conf_breakdown.items():
        is_top = (s_name == stroke)
        font_tag = f"<b>{s_name}</b>" if is_top else s_name
        prob_rows.append([Paragraph(font_tag, body_style), f"{s_prob*100:.1f}%"])
    
    prob_table = Table(prob_rows, colWidths=[2.0 * inch, 1.2 * inch])
    prob_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SECONDARY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('ALIGN', (1,0), (1,-1), 'RIGHT'),
    ]))

    score_keys = [
        ("Head Stability", "head"),
        ("Shoulder Alignment", "shoulder"),
        ("Lead Elbow Position", "elbow"),
        ("Hand Control", "hand"),
        ("Hip Rotation", "hip"),
        ("Knee Position", "knee"),
        ("Footwork & Stance", "feet"),
        ("Balance", "balance"),
        ("Follow Through", "follow_through")
    ]
    score_rows = [["Metric", "Score / 100", "Rating"]]
    for label, k in score_keys:
        val = scores.get(k, 0.0)
        rating = "Excellent" if val >= 85 else ("Good" if val >= 70 else "Needs Improvement")
        score_rows.append([Paragraph(label, body_style), f"{val:.1f}", rating])

    score_table = Table(score_rows, colWidths=[2.1 * inch, 1.0 * inch, 1.1 * inch])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('ALIGN', (1,0), (1,-1), 'CENTER'),
    ]))

    two_col_table = Table([[prob_table, score_table]], colWidths=[3.4 * inch, 3.8 * inch])
    two_col_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(two_col_table)
    story.append(Spacer(1, 15))

    # 5. Biomechanical Pose Metrics (Detailed Measurements)
    story.append(Paragraph("Biomechanical Pose & Keypoint Measurements", h2_style))
    
    head_b = body.get("head", {})
    shoulder_b = body.get("shoulder", {})
    elbow_b = body.get("elbow", {})
    hand_b = body.get("hand", {})
    hip_b = body.get("hip", {})
    feet_b = body.get("feet", {})

    biomech_rows = [
        ["Body Area", "Key Measurement", "Value", "Baseline Range"],
        ["Head", "Lateral Variance", f"{head_b.get('stability_variance', 0):.6f}", "< 0.0150"],
        ["Shoulders", "Rotation Range", f"{shoulder_b.get('rotation_range_degrees', 0):.1f}°", "15.0° - 50.0°"],
        ["Elbows", "Lead Elbow Angle at Impact", f"{elbow_b.get('impact_lead_angle', 0):.1f}°", "110.0° - 165.0°"],
        ["Hands", "Max Downswing Velocity", f"{hand_b.get('max_downswing_velocity', 0):.4f}", "0.0200 - 0.2000"],
        ["Hips", "Rotation Range", f"{hip_b.get('rotation_range_degrees', 0):.1f}°", "15.0° - 55.0°"],
        ["Feet & Stance", "Avg Left / Right Knee Flex", f"{feet_b.get('mean_left_knee_angle', 0):.1f}° / {feet_b.get('mean_right_knee_angle', 0):.1f}°", "115.0° - 165.0°"],
        ["Stance Width", "Mean Stance Width", f"{feet_b.get('mean_stance_width', 0):.4f}", "0.1500 - 0.5000"]
    ]

    biomech_table = Table(biomech_rows, colWidths=[1.4 * inch, 2.6 * inch, 1.6 * inch, 1.6 * inch])
    biomech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), LIGHT_BG),
        ('TEXTCOLOR', (0,0), (-1,0), PRIMARY),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER),
        ('ALIGN', (2,0), (-1,-1), 'CENTER'),
    ]))
    story.append(biomech_table)
    story.append(Spacer(1, 15))

    # 6. Performance Visualizations (Matplotlib & Seaborn Charts)
    chart_paths = visualizations.get("_paths", {})
    if chart_paths:
        story.append(Paragraph("Performance Visualizations & Kinematic Charts", h2_style))
        for c_label, c_path in [
            ("Score Breakdown Chart", chart_paths.get("scoreBreakdown")),
            ("Stroke Prediction Confidence", chart_paths.get("predictionConfidence")),
            ("Landmark Movement Trajectories", chart_paths.get("landmarkTrajectory")),
            ("Joint Angle Dynamics", chart_paths.get("jointAngles")),
            ("Body Stability & Stance Width", chart_paths.get("stability"))
        ]:
            if c_path and os.path.exists(c_path):
                story.append(Paragraph(f"<b>{c_label}</b>", body_style))
                story.append(Spacer(1, 4))
                story.append(Image(c_path, width=6.8 * inch, height=3.6 * inch))
                story.append(Spacer(1, 12))

    # 7. Biomechanical Feedback & Focus Areas
    story.append(Paragraph("Biomechanical Feedback & Technical Observations", h2_style))
    for item in feedback:
        severity = item.get("severity", "medium")
        body_part = item.get("body_part", "General").capitalize()
        issue = item.get("issue", "")
        text = item.get("feedback", "")
        
        fb_p = Paragraph(
            f"• <b>[{body_part}]</b> {issue}<br/>"
            f"<font color='{DARK_TEXT.hexval()}'>{text}</font>",
            body_style
        )
        story.append(fb_p)
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 10))

    # 8. Stroke-Specific Coaching Recommendations
    story.append(Paragraph("Stroke-Specific Coaching Guidance", h2_style))
    coach_box = Table([[Paragraph(f"<b>Coaching Recommendation:</b><br/>{coaching}", body_style)]], colWidths=[7.2 * inch])
    coach_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, ACCENT),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(coach_box)

    doc.build(story)
    return os.path.abspath(output_pdf_path)

