# Portable Cricket Shot Analysis ML Module (`ml/`)

This directory is a self-contained, portable Machine Learning & Computer Vision package for Cricket Batting Stroke Classification, Biomechanical Body Analysis, Technique Scoring, and Coaching Feedback.

---

## 📁 Package Architecture

```
ml/
├── api/
│   ├── __init__.py
│   └── analyze.py                # Public Entrypoint: analyze_video(video_path)
├── models/
│   ├── __init__.py
│   ├── bilstm.py                 # PyTorch BiLSTM Architecture
│   ├── cnn_bilstm.py             # PyTorch 1D Temporal CNN + BiLSTM Architecture
│   ├── attention.py              # PyTorch BiLSTM + Self-Attention Architecture
│   ├── best_model.pth            # Saved PyTorch Model Weights
│   └── model_metadata.json       # Model configuration & class labels
├── assets/
│   ├── feature_mean.npy          # Training Mean vector for 528 features
│   └── feature_std.npy           # Training Std vector for 528 features
├── pose/
│   ├── __init__.py
│   └── pose_extractor.py         # MediaPipe 33 Landmark Pose Extractor
├── features/
│   ├── __init__.py
│   ├── feature_engineering.py    # 528-dim Feature Engineer (Orig + Vel + Acc + Rel)
│   ├── sequence_builder.py       # 30-frame Temporal Resampler
│   └── normalization.py          # Feature Normalizer (fitted on Train set)
├── preprocessing/
│   ├── __init__.py
│   └── video_preprocessing.py    # Video file reader & validator
├── analysis/
│   ├── __init__.py
│   ├── pose_analysis.py          # Biomechanical joint angle & movement analyzer
│   ├── scoring.py                # Deterministic 0-100 technique scorer
│   └── feedback.py               # Actionable coaching feedback generator
├── config/
│   └── config.yaml               # Feature & model configurations
├── requirements.txt              # Minimal inference dependencies
├── test_ml.py                    # Independent test runner
└── README.md
```

---

## 🚀 How to Integration / Usage

### Python API Usage:

```python
from ml.api.analyze import analyze_video

result = analyze_video("path/to/batting_clip.mp4")

# Prediction
print(result["prediction"]["stroke"])       # e.g., "Cut"
print(result["prediction"]["confidence"])   # e.g., 0.985

# Scores (0-100)
print(result["scores"]["overall"])          # e.g., 68.5
print(result["scores"]["head"])             # e.g., 69.9

# Structured Feedback
for fb in result["feedback"]:
    print(fb["issue"], "->", fb["feedback"])
```

### CLI Command Testing:

```bash
python ml/test_ml.py datasets/batting_clips/P1_V10_1_0Dh9W8p1.mp4
```

---

## 🛠 Features & Pipeline Specifications

1. **Pose Extractor**: MediaPipe Pose (33 body landmarks \(\times\) 4 coordinates = 132 features/frame).
2. **528 Features/Frame**:
   - 132 OriginalPose
   - 132 Velocity (\(\frac{dP}{dt}\))
   - 132 Acceleration (\(\frac{d^2P}{dt^2}\))
   - 132 Pelvis-Centered Relative Position
3. **Temporal Alignment**: Resampled to fixed 30-frame sequence \((30 \times 528)\).
4. **Normalization**: Means and Stds loaded from `ml/assets/` (fitted exclusively on training set).
5. **Class Output**: 6 stroke classes (`Block`, `Cut`, `Glance`, `Hook`, `OffDrive`, `OnDrive`).
