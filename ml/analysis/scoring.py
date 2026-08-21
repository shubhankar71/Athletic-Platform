import numpy as np

def score_range_penalty(val, ideal_min, ideal_max, scale=2.0):
    """Calculates a score (0-100) based on distance from ideal metric range."""
    if val < ideal_min:
        penalty = (ideal_min - val) * scale
    elif val > ideal_max:
        penalty = (val - ideal_max) * scale
    else:
        penalty = 0.0
    return float(np.clip(100.0 - penalty, 0.0, 100.0))

class TechniqueScorer:
    """
    Deterministic technique scoring engine (0-100 scale) based on calculated pose features.
    Documented scoring formulas:
    - Head score: 100 - (lateral variance * 2500), clamped [40, 100]
    - Shoulder score: Ideal rotation range 15 to 50 deg
    - Elbow score: Ideal lead elbow angle 110 to 165 deg
    - Hand score: Ideal hand separation 0.05 to 0.35
    - Hip score: Ideal rotation range 15 to 55 deg
    - Feet/Knee score: Ideal average knee flex 115 to 165 deg
    - Stance score: Ideal stance width 0.15 to 0.50
    """
    
    def compute_scores(self, body_analysis):
        head = body_analysis["head"]
        shoulder = body_analysis["shoulder"]
        elbow = body_analysis["elbow"]
        hand = body_analysis["hand"]
        hip = body_analysis["hip"]
        feet = body_analysis["feet"]

        # 1. Head score
        head_score = float(np.clip(100.0 - head["stability_variance"] * 2500.0, 40.0, 100.0))

        # 2. Shoulder score
        shoulder_score = score_range_penalty(shoulder["rotation_range_degrees"], 15.0, 50.0, scale=1.5)

        # 3. Elbow score
        elbow_score = score_range_penalty(elbow["impact_lead_angle"], 110.0, 165.0, scale=1.2)

        # 4. Hand control score
        hand_score = score_range_penalty(hand["mean_separation_distance"], 0.05, 0.35, scale=200.0)

        # 5. Hip rotation score
        hip_score = score_range_penalty(hip["rotation_range_degrees"], 15.0, 55.0, scale=1.4)

        # 6. Knee / Feet position score
        avg_knee = (feet["mean_left_knee_angle"] + feet["mean_right_knee_angle"]) / 2.0
        knee_score = score_range_penalty(avg_knee, 115.0, 165.0, scale=1.5)

        # 7. Footwork score
        footwork_score = score_range_penalty(feet["mean_stance_width"], 0.15, 0.50, scale=150.0)

        # 8. Balance score
        balance_score = float(np.mean([head_score, footwork_score]))

        # 9. Follow-through score
        follow_through_score = score_range_penalty(hand["max_downswing_velocity"], 0.02, 0.20, scale=300.0)

        # 10. Overall technique score (weighted average)
        weights = {
            "head": 0.15, "shoulders": 0.10, "elbows": 0.10,
            "hands": 0.10, "hips": 0.10, "knees": 0.10,
            "feet": 0.15, "balance": 0.10, "follow_through": 0.10
        }
        
        scores_dict = {
            "head": round(head_score, 1),
            "shoulder": round(shoulder_score, 1),
            "elbow": round(elbow_score, 1),
            "hand": round(hand_score, 1),
            "hip": round(hip_score, 1),
            "knee": round(knee_score, 1),
            "feet": round(footwork_score, 1),
            "balance": round(balance_score, 1),
            "follow_through": round(follow_through_score, 1)
        }

        overall = sum(scores_dict[k] * w for k, w in zip(scores_dict.keys(), weights.values()))
        overall_score = round(float(overall), 1)

        scores_dict["overall"] = overall_score
        return scores_dict
