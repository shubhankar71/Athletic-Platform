import numpy as np

class SequenceBuilder:
    """
    Converts feature sequences of arbitrary frame length T into fixed-length (target_length, num_features) sequences.
    Default target_length = 30, num_features = 528.
    """
    
    def __init__(self, target_length=30):
        self.target_length = target_length

    def build_sequence(self, feature_matrix):
        """
        Args:
            feature_matrix: np.ndarray of shape (T, F) where F=528
        Returns:
            np.ndarray: shape (target_length, F)
        """
        T, F = feature_matrix.shape
        if T == self.target_length:
            return feature_matrix.astype(np.float32)

        target_indices = np.linspace(0, T - 1, self.target_length)
        resampled_features = np.zeros((self.target_length, F), dtype=np.float32)
        original_indices = np.arange(T)

        for col in range(F):
            resampled_features[:, col] = np.interp(target_indices, original_indices, feature_matrix[:, col])

        return resampled_features
