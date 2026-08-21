import sys
import os
from pathlib import Path

# Add root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[0]))
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import cv2
import numpy as np
import tempfile
import json
from ml.api.analyze import analyze_video

def create_synthetic_cricket_video(filename="synthetic_cricket.mp4", num_frames=60):
    """Generates a synthetic 60-frame MP4 video clip for testing pose extraction."""
    height, width = 480, 640
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(filename, fourcc, 30.0, (width, height))

    for i in range(num_frames):
        # Create dark green pitch background
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        frame[:] = (34, 139, 34)

        # Draw a synthetic human figure (head, body, arms, legs) so MediaPipe / OpenCV processes frames cleanly
        # Head
        cv2.circle(frame, (320, 120), 30, (255, 220, 180), -1)
        # Torso
        cv2.line(frame, (320, 150), (320, 300), (255, 255, 255), 12)
        # Arms (simulating a stroke swing)
        arm_offset = int(20 * np.sin(i * 0.1))
        cv2.line(frame, (320, 180), (250 + arm_offset, 240), (255, 255, 255), 8)
        cv2.line(frame, (320, 180), (390 - arm_offset, 240), (255, 255, 255), 8)
        # Legs
        cv2.line(frame, (320, 300), (280, 420), (255, 255, 255), 10)
        cv2.line(frame, (320, 300), (360, 420), (255, 255, 255), 10)

        out.write(frame)

    out.release()
    return os.path.abspath(filename)

if __name__ == "__main__":
    vid_path = create_synthetic_cricket_video()
    print(f"Created synthetic video: {vid_path}")
    
    print("Running analyze_video on synthetic clip...")
    try:
        res = analyze_video(vid_path)
        print("\nSUCCESS! Output dictionary keys:", list(res.keys()))
        print("Prediction:", res["prediction"])
        print("Scores:", res["scores"])
    except Exception as e:
        import traceback
        traceback.print_exc()
