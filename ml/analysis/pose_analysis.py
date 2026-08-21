import numpy as np

def calculate_angle_3pts(a, b, c):
    """
    Calculates angle in degrees at joint b given 3D coordinates a, b, c.
    Vector BA = a - b, Vector BC = c - b
    """
    ba = a - b
    bc = c - b
    
    norm_ba = np.linalg.norm(ba)
    norm_bc = np.linalg.norm(bc)
    
    if norm_ba < 1e-6 or norm_bc < 1e-6:
        return 0.0
        
    cosine_angle = np.dot(ba, bc) / (norm_ba * norm_bc)
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
    angle_rad = np.arccos(cosine_angle)
    return float(np.degrees(angle_rad))

class TechniqueAnalyzer:
    """
    Analyzes body positioning, spatial angles, movement stability, and stroke phase timing
    from 33 MediaPipe pose landmarks across 30 frames.
    """
    
    def __init__(self):
        # Landmark indices
        self.NOSE = 0
        self.LEFT_SHOULDER = 11
        self.RIGHT_SHOULDER = 12
        self.LEFT_ELBOW = 13
        self.RIGHT_ELBOW = 14
        self.LEFT_WRIST = 15
        self.RIGHT_WRIST = 16
        self.LEFT_HIP = 23
        self.RIGHT_HIP = 24
        self.LEFT_KNEE = 25
        self.RIGHT_KNEE = 26
        self.LEFT_ANKLE = 27
        self.RIGHT_ANKLE = 28

    def analyze_pose_sequence(self, landmarks_3d):
        """
        Args:
            landmarks_3d: np.ndarray of shape (T, 33, 4) where T=30
        Returns:
            dict containing computed biomechanical metrics over time
        """
        T = len(landmarks_3d)
        
        # 1. Head analysis
        nose_coords = landmarks_3d[:, self.NOSE, :3] # (T, 3)
        head_stability_var = float(np.var(nose_coords[:, :2])) # lateral variance
        
        # 2. Shoulder line angle over time
        shoulder_diffs = landmarks_3d[:, self.LEFT_SHOULDER, :2] - landmarks_3d[:, self.RIGHT_SHOULDER, :2]
        shoulder_angles = np.degrees(np.arctan2(shoulder_diffs[:, 1], shoulder_diffs[:, 0]))
        shoulder_rotation_range = float(np.ptp(shoulder_angles))
        
        # 3. Elbow angles over time
        lead_elbow_angles = []
        rear_elbow_angles = []
        for t in range(T):
            ls = landmarks_3d[t, self.LEFT_SHOULDER, :3]
            le = landmarks_3d[t, self.LEFT_ELBOW, :3]
            lw = landmarks_3d[t, self.LEFT_WRIST, :3]
            lead_elbow_angles.append(calculate_angle_3pts(ls, le, lw))
            
            rs = landmarks_3d[t, self.RIGHT_SHOULDER, :3]
            re = landmarks_3d[t, self.RIGHT_ELBOW, :3]
            rw = landmarks_3d[t, self.RIGHT_WRIST, :3]
            rear_elbow_angles.append(calculate_angle_3pts(rs, re, rw))
            
        lead_elbow_angles = np.array(lead_elbow_angles)
        rear_elbow_angles = np.array(rear_elbow_angles)
        
        # 4. Hand separation and hand velocity
        hand_dist = np.linalg.norm(landmarks_3d[:, self.LEFT_WRIST, :3] - landmarks_3d[:, self.RIGHT_WRIST, :3], axis=1)
        hand_mid = (landmarks_3d[:, self.LEFT_WRIST, :3] + landmarks_3d[:, self.RIGHT_WRIST, :3]) / 2.0
        hand_velocity = np.zeros(T)
        if T > 1:
            hand_velocity[1:] = np.linalg.norm(hand_mid[1:] - hand_mid[:-1], axis=1)
            hand_velocity[0] = hand_velocity[1]
            
        estimated_impact_frame = int(np.argmax(hand_velocity))
        
        # 5. Hip rotation angle over time
        hip_diffs = landmarks_3d[:, self.LEFT_HIP, :2] - landmarks_3d[:, self.RIGHT_HIP, :2]
        hip_angles = np.degrees(np.arctan2(hip_diffs[:, 1], hip_diffs[:, 0]))
        hip_rotation_range = float(np.ptp(hip_angles))

        # 6. Knee angles over time
        left_knee_angles = []
        right_knee_angles = []
        for t in range(T):
            lh = landmarks_3d[t, self.LEFT_HIP, :3]
            lk = landmarks_3d[t, self.LEFT_KNEE, :3]
            la = landmarks_3d[t, self.LEFT_ANKLE, :3]
            left_knee_angles.append(calculate_angle_3pts(lh, lk, la))
            
            rh = landmarks_3d[t, self.RIGHT_HIP, :3]
            rk = landmarks_3d[t, self.RIGHT_KNEE, :3]
            ra = landmarks_3d[t, self.RIGHT_ANKLE, :3]
            right_knee_angles.append(calculate_angle_3pts(rh, rk, ra))

        left_knee_angles = np.array(left_knee_angles)
        right_knee_angles = np.array(right_knee_angles)

        # 7. Feet / Stance width
        stance_width = np.linalg.norm(landmarks_3d[:, self.LEFT_ANKLE, :2] - landmarks_3d[:, self.RIGHT_ANKLE, :2], axis=1)

        # 8. Movement Phases Estimation
        phases = {
            "stance": [0, int(max(1, estimated_impact_frame // 3))],
            "preparation": [int(max(1, estimated_impact_frame // 3)), int(max(2, 2 * estimated_impact_frame // 3))],
            "downswing": [int(max(2, 2 * estimated_impact_frame // 3)), estimated_impact_frame],
            "estimated_impact": estimated_impact_frame,
            "follow_through": [estimated_impact_frame, T - 1]
        }

        body_analysis = {
            "head": {
                "stability_variance": round(head_stability_var, 6),
                "mean_y_position": round(float(np.mean(nose_coords[:, 1])), 4)
            },
            "shoulder": {
                "rotation_range_degrees": round(shoulder_rotation_range, 2)
            },
            "elbow": {
                "mean_lead_angle": round(float(np.mean(lead_elbow_angles)), 2),
                "impact_lead_angle": round(float(lead_elbow_angles[estimated_impact_frame]), 2),
                "mean_rear_angle": round(float(np.mean(rear_elbow_angles)), 2)
            },
            "hand": {
                "mean_separation_distance": round(float(np.mean(hand_dist)), 4),
                "max_downswing_velocity": round(float(np.max(hand_velocity)), 4)
            },
            "hip": {
                "rotation_range_degrees": round(hip_rotation_range, 2)
            },
            "feet": {
                "mean_left_knee_angle": round(float(np.mean(left_knee_angles)), 2),
                "mean_right_knee_angle": round(float(np.mean(right_knee_angles)), 2),
                "mean_stance_width": round(float(np.mean(stance_width)), 4)
            },
            "timing": {
                "estimated_impact_frame": estimated_impact_frame,
                "phases": phases
            }
        }
        return body_analysis
