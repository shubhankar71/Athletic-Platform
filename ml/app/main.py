import os
import sys
import tempfile
import uuid
import requests
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field, HttpUrl

# Ensure parent directory is in sys.path so 'ml' package can be imported properly
BASE_DIR = Path(__file__).resolve().parents[2]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from ml.api.analyze import analyze_video
from ml.inference.predictor import CricketStrokePredictor
from ml.reports.pdf_generator import generate_pdf_report

# Global predictor instance loaded ONCE at startup
predictor_instance = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager loading the ML model ONCE at server startup."""
    global predictor_instance
    print("[ML Service] Pre-loading PyTorch BiLSTM model into memory...")
    try:
        predictor_instance = CricketStrokePredictor()
        print(f"[ML Service] Model '{predictor_instance.model_name}' successfully loaded into memory.")
    except Exception as e:
        print(f"[ML Service] Warning: Failed to pre-load model at startup: {e}")
    yield
    print("[ML Service] Shutting down ML service...")

app = FastAPI(
    title="Cricket Sports AI ML Inference Engine",
    description="FastAPI Service providing 528-feature pose extraction, BiLSTM stroke classification, biomechanical technique scoring, feedback, and PDF report generation.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REPORTS_DIR = BASE_DIR / "ml" / "reports" / "generated"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

class AnalysisRequest(BaseModel):
    video_url: str = Field(..., description="Cloudinary video URL or accessible video URL/path")
    user_id: str | None = Field(default=None, description="Optional user ID associated with request")

def download_video_file(video_url: str) -> str:
    """Securely downloads video from Cloudinary / HTTP URL to a temporary local file."""
    # Check if video_url is already a local file path
    if os.path.exists(video_url):
        return video_url
        
    if not (video_url.startswith("http://") or video_url.startswith("https://")):
        raise HTTPException(status_code=400, detail="Invalid video URL format. Must be an HTTP(S) URL or valid local file path.")

    try:
        response = requests.get(video_url, stream=True, timeout=60)
        response.raise_for_status()

        # Temporary file creation
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
        for chunk in response.iter_content(chunk_size=1024 * 1024):
            if chunk:
                temp_file.write(chunk)
        temp_file.close()
        return temp_file.name
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to download video from Cloudinary: {str(e)}")

def cleanup_file(file_path: str):
    """Helper to remove temporary files after request completion."""
    try:
        if file_path and os.path.exists(file_path) and "tmp" in file_path.lower():
            os.remove(file_path)
    except Exception:
        pass

@app.get("/")
@app.get("/api/ml/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Cricket AI ML Service",
        "model_loaded": predictor_instance is not None,
        "model_name": predictor_instance.model_name if predictor_instance else "None"
    }

@app.post("/api/ml/analyze")
def analyze_cricket_video(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """
    Main ML Inference Endpoint:
    1. Downloads Cloudinary video.
    2. Runs Pose Extraction, 528-feature building, 30-frame sequence normalization.
    3. Runs PyTorch BiLSTM stroke classification.
    4. Computes technique scoring & structured feedback.
    5. Generates PDF report.
    6. Returns full structured JSON payload.
    """
    video_path = request.video_url
    is_temp = False
    
    if video_url_is_remote := (video_path.startswith("http://") or video_path.startswith("https://")):
        video_path = download_video_file(video_path)
        is_temp = True
        background_tasks.add_task(cleanup_file, video_path)

    try:
        # Run ML analysis pipeline
        results = analyze_video(video_path)

        # Generate PDF report
        report_id = f"report_{uuid.uuid4().hex[:8]}.pdf"
        pdf_path = REPORTS_DIR / report_id
        generate_pdf_report(results, str(pdf_path))

        results["success"] = True
        results["pdf_filename"] = report_id
        results["pdf_download_url"] = f"/api/ml/pdf/{report_id}"

        return JSONResponse(content=results)

    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"[ML Analysis Error] {error_trace}")
        raise HTTPException(status_code=500, detail=f"ML Analysis failed: {str(e)}")

@app.get("/api/ml/pdf/{filename}")
def download_pdf(filename: str):
    """Serves the generated PDF analysis report."""
    pdf_path = REPORTS_DIR / filename
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="PDF report not found")
    
    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=filename
    )

@app.get("/api/ml/visualizations/{filename}")
def serve_visualization(filename: str):
    """Serves generated Matplotlib & Seaborn chart PNG images."""
    chart_path = REPORTS_DIR / filename
    if not chart_path.exists():
        raise HTTPException(status_code=404, detail="Visualization chart image not found")

    return FileResponse(
        path=str(chart_path),
        media_type="image/png",
        filename=filename
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ml.app.main:app", host="0.0.0.0", port=8000, reload=True)
