import os
import json
import torch
import numpy as np
from pathlib import Path

from ml.models.bilstm import BiLSTMClassifier
from ml.models.cnn_bilstm import CNNBiLSTMClassifier
from ml.models.attention import BiLSTMAttentionClassifier

class CricketStrokePredictor:
    """
    Loads saved model weights & metadata portably and performs inference.
    """
    
    def __init__(self, models_dir=None):
        if models_dir is None:
            models_dir = Path(__file__).resolve().parents[1] / "models"

        self.models_dir = Path(models_dir)
        metadata_path = self.models_dir / "model_metadata.json"
        weights_path = self.models_dir / "best_model.pth"

        if not metadata_path.exists() or not weights_path.exists():
            raise FileNotFoundError(f"Model metadata or weights not found in {self.models_dir}")

        with open(metadata_path, "r") as f:
            self.metadata = json.load(f)

        self.model_name = self.metadata.get("best_model_name", "BiLSTM_Attention")
        self.class_names = self.metadata.get("class_names", ["Block", "Cut", "Glance", "Hook", "OffDrive", "OnDrive"])

        if self.model_name == "BiLSTM":
            self.model = BiLSTMClassifier(input_dim=528, hidden_dim=128, num_classes=len(self.class_names))
        elif self.model_name == "CNN_BiLSTM":
            self.model = CNNBiLSTMClassifier(input_dim=528, cnn_channels=128, hidden_dim=128, num_classes=len(self.class_names))
        elif self.model_name == "BiLSTM_Attention":
            self.model = BiLSTMAttentionClassifier(input_dim=528, hidden_dim=128, num_classes=len(self.class_names))
        else:
            raise ValueError(f"Unknown model name: {self.model_name}")

        self.model.load_state_dict(torch.load(weights_path, map_location="cpu"))
        self.model.eval()

    def predict(self, norm_sequence):
        """
        Args:
            norm_sequence: np.ndarray of shape (30, 528) or (1, 30, 528)
        Returns:
            dict containing predicted_stroke, confidence, confidence_breakdown, and optional attention_weights
        """
        if norm_sequence.ndim == 2:
            x_tensor = torch.tensor(norm_sequence, dtype=torch.float32).unsqueeze(0) # (1, 30, 528)
        else:
            x_tensor = torch.tensor(norm_sequence, dtype=torch.float32) # (1, 30, 528)

        attn_weights = None
        with torch.no_grad():
            if self.model_name == "BiLSTM_Attention":
                logits, attn_tensor = self.model(x_tensor, return_attention=True)
                attn_weights = attn_tensor.squeeze(0).numpy().tolist()
            else:
                logits = self.model(x_tensor)
                if isinstance(logits, tuple):
                    logits = logits[0]
            
            probs = torch.softmax(logits, dim=1).squeeze(0).numpy()

        pred_idx = int(np.argmax(probs))
        predicted_stroke = self.class_names[pred_idx]
        confidence_breakdown = {self.class_names[i]: float(probs[i]) for i in range(len(self.class_names))}

        return {
            "predicted_stroke": predicted_stroke,
            "confidence": float(probs[pred_idx]),
            "confidence_breakdown": confidence_breakdown,
            "attention_weights": attn_weights
        }
