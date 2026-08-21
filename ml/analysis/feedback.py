class FeedbackGenerator:
    """
    Generates structured biomechanical feedback items and stroke-specific coaching advice
    based on actual body measurements and scores.
    """
    
    def generate_feedback(self, scores, stroke_prediction):
        feedback_list = []

        # 1. Head Feedback
        if scores.get("head", 100) < 75:
            feedback_list.append({
                "body_part": "head",
                "issue": "Excessive head movement detected during downswing",
                "severity": "high" if scores.get("head", 100) < 60 else "medium",
                "feedback": "Keep your head stable and eyes level over the line of the ball through impact."
            })

        # 2. Elbow Feedback
        if scores.get("elbow", 100) < 75:
            feedback_list.append({
                "body_part": "elbow",
                "issue": "Restricted lead-elbow extension at impact",
                "severity": "medium",
                "feedback": "High lead-elbow extension provides a clean bat path and full extension through the shot."
            })

        # 3. Hip Feedback
        if scores.get("hip", 100) < 75:
            feedback_list.append({
                "body_part": "hip",
                "issue": "Restricted hip rotation",
                "severity": "medium",
                "feedback": "Engage hips to transfer weight smoothly and generate power into the stroke."
            })

        # 4. Feet / Balance Feedback
        if scores.get("balance", 100) < 75:
            feedback_list.append({
                "body_part": "feet",
                "issue": "Body balance shifted late during stroke execution",
                "severity": "medium",
                "feedback": "Ensure front-foot step completes prior to downswing for a stable base."
            })

        if not feedback_list:
            feedback_list.append({
                "body_part": "overall",
                "issue": "None",
                "severity": "low",
                "feedback": "Solid stroke execution and body posture maintained throughout the sequence."
            })

        # Stroke-specific coaching heuristics
        stroke_coaching = {
            "Block": "Maintain a soft grip with hands close to the body. Ensure head is directly over the ball at impact to smother bounce.",
            "Cut": "Transfer weight onto the back foot. Free the arms and extend lead elbow high to cut down on short wide deliveries.",
            "Glance": "Use wrist roll effectively. Keep head stable and guide ball fine past leg slip or square leg.",
            "Hook": "Keep eyes on the short ball until impact. Rotate shoulders smoothly and control upper body balance on follow-through.",
            "OffDrive": "Step front foot towards the line of off-stump. Keep lead elbow pointed high towards mid-off.",
            "OnDrive": "Step front foot towards mid-on without closing off hips. Ensure full extension of arms through the line of the ball."
        }

        coaching_advice = stroke_coaching.get(
            stroke_prediction,
            "Focus on head stability, front-foot alignment, and smooth follow-through."
        )

        return feedback_list, coaching_advice
