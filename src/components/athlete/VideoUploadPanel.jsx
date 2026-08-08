import { useRef, useState } from "react";
import { CheckCircle2, FileVideo, Loader2, UploadCloud } from "lucide-react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import { uploadAnalysisVideo } from "../../api/mockApi.js";
import "./VideoUploadPanel.css";

// Explicit state machine for the upload lifecycle. Named states (rather than
// booleans) keep the UI unambiguous and make it trivial to slot in real
// upload-progress events from a FastAPI endpoint later.
const STAGES = {
  IDLE: "idle",
  UPLOADING: "uploading",
  PROCESSING: "processing",
  COMPLETE: "complete",
};

export default function VideoUploadPanel() {
  const [stage, setStage] = useState(STAGES.IDLE);
  const [fileName, setFileName] = useState(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    simulateUpload();
  }

  function simulateUpload() {
    setStage(STAGES.UPLOADING);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 18;
        if (next >= 100) {
          clearInterval(interval);
          setStage(STAGES.PROCESSING);
          uploadAnalysisVideo().then(() => {
            setStage(STAGES.COMPLETE);
          });
          return 100;
        }
        return next;
      });
    }, 260);
  }

  function reset() {
    setStage(STAGES.IDLE);
    setFileName(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <Card eyebrow="Analysis input" title="Upload session video">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelected}
        style={{ display: "none" }}
      />

      {stage === STAGES.IDLE && (
        <button className="upload-dropzone" onClick={() => inputRef.current?.click()}>
          <UploadCloud size={22} strokeWidth={1.75} color="var(--accent-teal)" />
          <p className="upload-dropzone__title">Drop a drill or race clip</p>
          <p className="upload-dropzone__hint">MP4 or MOV, up to 4 minutes</p>
        </button>
      )}

      {stage === STAGES.UPLOADING && (
        <div className="upload-progress">
          <div className="upload-progress__row">
            <FileVideo size={16} color="var(--text-secondary)" />
            <span className="upload-progress__name">{fileName}</span>
            <span className="mono-stat upload-progress__pct">{progress}%</span>
          </div>
          <div className="upload-progress__bar">
            <div className="upload-progress__bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="upload-dropzone__hint">Uploading to analysis pipeline…</p>
        </div>
      )}

      {stage === STAGES.PROCESSING && (
        <div className="upload-status">
          <Loader2 size={22} className="spin" color="var(--accent-teal)" />
          <div>
            <p className="upload-status__title">Running AI analysis</p>
            <p className="upload-dropzone__hint">
              Detecting frames, tracking joints, comparing to your baseline
            </p>
          </div>
        </div>
      )}

      {stage === STAGES.COMPLETE && (
        <div className="upload-status">
          <CheckCircle2 size={22} color="var(--accent-teal)" />
          <div>
            <p className="upload-status__title">{fileName}</p>
            <p className="upload-dropzone__hint">Analysis ready — feedback updated below</p>
          </div>
          <Button variant="ghost" size="sm" onClick={reset}>
            Upload another
          </Button>
        </div>
      )}
    </Card>
  );
}
