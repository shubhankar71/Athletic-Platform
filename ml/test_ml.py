import sys
import os
import json
from pathlib import Path

# Add parent directory of ml to sys.path so 'ml' can be imported as a package
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from ml.api.analyze import analyze_video

def main():
    if len(sys.argv) > 1:
        video_path = sys.argv[1]
    else:
        # Default fallback clip for testing
        default_clip = os.path.join(
            Path(__file__).resolve().parents[1],
            "datasets", "batting_clips", "P1_V10_1_0Dh9W8p1.mp4"
        )
        if os.path.exists(default_clip):
            video_path = default_clip
        else:
            print("Usage: python ml/test_ml.py <path_to_video.mp4>")
            sys.exit(1)

    print(f"Running Cricket AI analysis on: {video_path}...")
    res = analyze_video(video_path)

    pred = res["prediction"]
    scores = res["scores"]

    print("\n" + "=" * 40)
    print("CRICKET AI VIDEO ANALYSIS")
    print("=" * 40)
    print(f"\nVideo:\n{os.path.basename(video_path)}")
    print(f"\nPredicted Stroke:\n{pred['stroke']}")
    print(f"\nConfidence:\n{pred['confidence'] * 100:.1f}%")
    print("\nScores:")
    print(f"Head      : {scores.get('head', 0.0):.0f}")
    print(f"Shoulder  : {scores.get('shoulder', 0.0):.0f}")
    print(f"Elbow     : {scores.get('elbow', 0.0):.0f}")
    print(f"Hand      : {scores.get('hand', 0.0):.0f}")
    print(f"Hip       : {scores.get('hip', 0.0):.0f}")
    print(f"Feet      : {scores.get('feet', 0.0):.0f}")
    print(f"\nOverall:\n{scores.get('overall', 0.0):.0f}")

    print("\nFeedback:")
    for i, fb in enumerate(res["feedback"], 1):
        print(f"{i}. {fb['feedback']}")

    print(f"\nCoaching Advice:\n{res['coaching_text']}")
    print("=" * 40)

if __name__ == "__main__":
    main()
