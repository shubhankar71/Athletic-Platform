import os
import json
import numpy as np

from ml.preprocessing.video_preprocessing import VideoPreprocessor
from ml.pose.pose_extractor import PoseExtractor
from ml.features.feature_engineering import FeatureEngineer
from ml.features.sequence_builder import SequenceBuilder
from ml.features.normalization import FeatureNormalizer
from ml.inference.predictor import CricketStrokePredictor
from ml.analysis.pose_analysis import TechniqueAnalyzer
from ml.analysis.scoring import TechniqueScorer
from ml.analysis.feedback import FeedbackGenerator
from ml.analysis.visualizer import VisualizationGenerator

def analyze_video(video_path):
    """
    Complete End-to-End Portable ML Inference Entry Point.
    
    Args:
        video_path (str): Absolute or relative path to input video file.
        
    Returns:
        dict: Clean, JSON-serializable dictionary containing:
            - prediction (stroke, confidence, confidence_breakdown)
            - scores (overall, head, shoulder, elbow, hand, hip, feet, balance, follow_through)
            - body_analysis (head, shoulder, elbow, hand, hip, feet, timing)
            - feedback (list of structured feedback items)
            - coaching_text (stroke-specific coaching guidance)
            - video_metadata (resolution, fps, total_frames, detection_rate)
            - visualizations (scoreBreakdown, predictionConfidence, landmarkTrajectory, jointAngles, stability)
    """
    # 1. Preprocess & Validate Video
    preprocessor = VideoPreprocessor()
    meta = preprocessor.validate_video(video_path)

    # 2. Extract Pose Landmarks (T, 33, 4)
    extractor = PoseExtractor(model_complexity=0, static_image_mode=False)
    landmarks, pose_meta = extractor.extract_landmarks_from_video(video_path)
    extractor.close()

    # Update metadata with pose detection statistics
    meta["detected_frames"] = pose_meta["detected_frames"]
    meta["detection_rate"] = pose_meta["detection_rate"]

    # 3. Feature Engineering (T, 528)
    fe = FeatureEngineer()
    raw_features = fe.compute_features_sequence(landmarks)

    # 4. Sequence Resampling (30, 528)
    sb = SequenceBuilder(target_length=30)
    seq_528 = sb.build_sequence(raw_features)

    # 5. Normalization using saved mean/std
    normalizer = FeatureNormalizer()
    normalizer.load_params() # Uses relative asset directory
    norm_seq = normalizer.transform(seq_528)

    # 6. Model Prediction
    predictor = CricketStrokePredictor() # Uses relative model directory
    pred_res = predictor.predict(norm_seq)

    # ML INFERENCE DEBUG BOX
    print("=" * 50)
    print("ML INFERENCE DEBUG")
    print("=" * 50)
    print(f"Video Path: {video_path}")
    print(f"Video Size: {meta.get('file_size_bytes', 0)} bytes")
    print(f"Video SHA256 Hash: {meta.get('video_hash', 'N/A')}")
    print(f"Resolution: {meta.get('width', 0)}x{meta.get('height', 0)} | FPS: {meta.get('fps', 0)} | Frames: {meta.get('total_frames', 0)}")
    print(f"Pose frames detected: {meta.get('detected_frames', 0)} / {meta.get('total_frames', 0)} (Rate: {round(meta.get('detection_rate', 0)*100, 1)}%)")
    print(f"Feature matrix shape: {seq_528.shape}")
    print(f"Feature mean: {float(np.mean(seq_528)):.4f} | std: {float(np.std(seq_528)):.4f} | min: {float(np.min(seq_528)):.4f} | max: {float(np.max(seq_528)):.4f}")
    print(f"Normalized mean: {float(np.mean(norm_seq)):.4f} | std: {float(np.std(norm_seq)):.4f}")
    print("Prediction probabilities:")
    for stroke_cls, prob_val in pred_res["confidence_breakdown"].items():
        print(f"  {stroke_cls:10s}: {prob_val:.4f} ({prob_val*100:.2f}%)")
    print(f"Predicted Class ID: {pred_res.get('class_id', 'N/A')}")
    print(f"Predicted Shot: {pred_res['predicted_stroke']}")
    print(f"Confidence: {pred_res['confidence']*100:.2f}%")
    print("=" * 50)

    # 7. Body Position Analysis

    # Resample 3D landmarks to 30 frames for spatial analysis
    landmarks_30 = sb.build_sequence(landmarks.reshape(len(landmarks), -1)).reshape(30, 33, 4)
    analyzer = TechniqueAnalyzer()
    body_analysis = analyzer.analyze_pose_sequence(landmarks_30)

    # 8. Technique Scoring
    scorer = TechniqueScorer()
    scores = scorer.compute_scores(body_analysis)

    # 9. Feedback & Coaching Advice
    fg = FeedbackGenerator()
    feedback_items, coaching_text = fg.generate_feedback(scores, pred_res["predicted_stroke"])

    # 10. Matplotlib & Seaborn Visualizations Generation
    pred_dict = {
        "stroke": pred_res["predicted_stroke"],
        "confidence": round(pred_res["confidence"], 4),
        "confidence_breakdown": {k: round(v, 4) for k, v in pred_res["confidence_breakdown"].items()}
    }
    vg = VisualizationGenerator()
    visualizations = vg.generate_all_visualizations(body_analysis, scores, pred_dict, landmarks_30)

    # 11. Construct Final Result Dictionary
    return {
        "prediction": pred_dict,
        "scores": scores,
        "body_analysis": body_analysis,
        "feedback": feedback_items,
        "coaching_text": coaching_text,
        "video_metadata": meta,
        "visualizations": visualizations
    }


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        v_path = sys.argv[1]
        res = analyze_video(v_path)
        print(json.dumps(res, indent=2))
