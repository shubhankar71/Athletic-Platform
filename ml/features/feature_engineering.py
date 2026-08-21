import numpy as np

class FeatureEngineer:
    """
    Computes 528 temporal and spatial features per frame from raw MediaPipe landmarks.
    
    Feature composition (132 * 4 = 528):
    1. Original (132): [x, y, z, vis] for 33 landmarks
    2. Velocity (132): First discrete temporal difference (dx/dt, dy/dt, dz/dt, dvis/dt)
    3. Acceleration (132): Second discrete temporal difference (d2x/dt2, d2y/dt2, d2z/dt2, d2vis/dt2)
    4. Relative Position (132): Landmark (x,y,z) relative to mid-hip center (indices 23 and 24)
    """
    
    def __init__(self, left_hip_idx=23, right_hip_idx=24):
        self.left_hip_idx = left_hip_idx
        self.right_hip_idx = right_hip_idx

    def compute_features_sequence(self, landmarks):
        """
        Args:
            landmarks: np.ndarray of shape (T, 33, 4)
        Returns:
            np.ndarray: shape (T, 528)
        """
        T, N, C = landmarks.shape
        assert N == 33 and C == 4, f"Expected shape (T, 33, 4), got {landmarks.shape}"

        # 1. Original features (T, 132)
        orig_features = landmarks.reshape(T, N * C)

        # 2. Velocity features (T, 132)
        velocity = np.zeros_like(orig_features)
        if T > 1:
            velocity[1:] = orig_features[1:] - orig_features[:-1]
            velocity[0] = velocity[1] # edge pad

        # 3. Acceleration features (T, 132)
        acceleration = np.zeros_like(orig_features)
        if T > 2:
            acceleration[1:] = velocity[1:] - velocity[:-1]
            acceleration[0] = acceleration[1] # edge pad

        # 4. Relative position features (T, 132)
        rel_landmarks = np.copy(landmarks)
        for t in range(T):
            left_hip = landmarks[t, self.left_hip_idx, :3] # x,y,z
            right_hip = landmarks[t, self.right_hip_idx, :3] # x,y,z
            hip_center = (left_hip + right_hip) / 2.0
            
            # Subtract hip center from all landmark coordinates (keep visibility unchanged)
            rel_landmarks[t, :, :3] = landmarks[t, :, :3] - hip_center

        rel_features = rel_landmarks.reshape(T, N * C)

        # Concatenate all 4 feature groups along column dimension: 132 + 132 + 132 + 132 = 528
        feature_matrix = np.hstack([orig_features, velocity, acceleration, rel_features]) # (T, 528)
        
        return feature_matrix.astype(np.float32)
