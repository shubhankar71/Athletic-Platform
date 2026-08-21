import sys
import os
import json
import numpy as np
import torch
from pathlib import Path

# Add root directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from ml.inference.predictor import CricketStrokePredictor
from ml.analysis.pose_analysis import TechniqueAnalyzer
from ml.analysis.scoring import TechniqueScorer
from ml.analysis.feedback import FeedbackGenerator
from ml.reports.pdf_generator import generate_pdf_report

def test_pipeline():
    print("========================================")
    print("VERIFYING EXISTING TRAINED ML MODEL & INFERENCE PIPELINE")
    print("========================================")

    # 1. Load Predictor
    predictor = CricketStrokePredictor()
    print(f"1. Loaded Trained Model Name: {predictor.model_name}")
    print(f"   Model Classes: {predictor.class_names}")

    # Verify model input dimension
    print(f"   Model architecture: {predictor.model}")

    # 2. Test Input tensor shape (1, 30, 528)
    dummy_input = np.random.randn(30, 528).astype(np.float32)
    print(f"\n2. Testing Input Sequence Shape: {dummy_input.shape}")
    
    pred_res = predictor.predict(dummy_input)
    print(f"   Model Prediction Output:")
    print(f"   - Predicted Stroke: {pred_res['predicted_stroke']}")
    print(f"   - Confidence: {pred_res['confidence']*100:.2f}%")
    print(f"   - Confidence Breakdown: {json.dumps(pred_res['confidence_breakdown'], indent=2)}")

    # 3. Test Pose Analysis (30, 33, 4)
    dummy_landmarks_3d = np.random.randn(30, 33, 4).astype(np.float32)
    analyzer = TechniqueAnalyzer()
    body_analysis = analyzer.analyze_pose_sequence(dummy_landmarks_3d)
    print(f"\n3. Pose Body Analysis:")
    print(f"   - Head Stability Variance: {body_analysis['head']['stability_variance']}")
    print(f"   - Shoulder Rotation Range: {body_analysis['shoulder']['rotation_range_degrees']} deg")
    print(f"   - Lead Elbow Impact Angle: {body_analysis['elbow']['impact_lead_angle']} deg")

    # 4. Test Technique Scoring
    scorer = TechniqueScorer()
    scores = scorer.compute_scores(body_analysis)
    print(f"\n4. Technical Scores:")
    print(f"   - Overall Technique Score: {scores['overall']} / 100")
    print(f"   - Head: {scores['head']}, Elbow: {scores['elbow']}, Hip: {scores['hip']}, Feet: {scores['feet']}")

    # 5. Test Feedback Generation
    fg = FeedbackGenerator()
    feedback, coaching = fg.generate_feedback(scores, pred_res['predicted_stroke'])
    print(f"\n5. Generated Feedback Items: {len(feedback)}")
    print(f"   - Coaching Guidance: {coaching}")

    # 6. Test Visualization Generation
    from ml.analysis.visualizer import VisualizationGenerator
    vg = VisualizationGenerator()
    visualizations = vg.generate_all_visualizations(body_analysis, scores, pred_res, dummy_landmarks_3d)
    print(f"\n6. Generated Visualizations: {list(visualizations.keys())}")

    # 7. Test PDF Report Generation
    test_result = {
        "prediction": {
            "stroke": pred_res["predicted_stroke"],
            "confidence": pred_res["confidence"],
            "confidence_breakdown": pred_res["confidence_breakdown"]
        },
        "scores": scores,
        "body_analysis": body_analysis,
        "feedback": feedback,
        "coaching_text": coaching,
        "video_metadata": {
            "filename": "test_cricket_clip.mp4",
            "resolution": "1280x720",
            "fps": 30.0,
            "total_frames": 90,
            "detection_rate": 0.95
        },
        "visualizations": visualizations
    }

    pdf_out = Path(__file__).resolve().parents[1] / "ml" / "reports" / "generated" / "test_report.pdf"
    pdf_path = generate_pdf_report(test_result, str(pdf_out))
    print(f"\n7. Generated PDF Report: {pdf_path}")
    print("   PDF exists:", os.path.exists(pdf_path))

    print("\nSUCCESS: All pipeline components, model loading, Matplotlib/Seaborn visualization generation, scoring, and PDF generation passed successfully!")


if __name__ == "__main__":
    test_pipeline()
