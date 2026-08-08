import { useState } from "react";
import Card from "../ui/Card.jsx";
import { LoadingBlock } from "../ui/LoadingState.jsx";
import AccuracyErrorChart from "../charts/AccuracyErrorChart.jsx";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import {
  getAccuracyErrorTrend,
  getAiFeedback,
  getAnalysisSessions,
} from "../../api/mockApi.js";
import SessionList from "./SessionList.jsx";
import VideoUploadPanel from "./VideoUploadPanel.jsx";
import AIFeedbackPanel from "./AIFeedbackPanel.jsx";
import AIChatPanel from "./AIChatPanel.jsx";

export default function AIAnalysisTab() {
  const { data: sessions, isLoading: sessionsLoading } = useAsyncData(getAnalysisSessions, []);
  const { data: trend, isLoading: trendLoading } = useAsyncData(getAccuracyErrorTrend, []);
  const { data: feedback, isLoading: feedbackLoading } = useAsyncData(getAiFeedback, []);
  const [activeSessionId, setActiveSessionId] = useState("an_001");

  return (
    <div className="stack">
      <div className="grid-2">
        <Card eyebrow="Performance trend" title="Accuracy vs. error rate">
          {trendLoading ? <LoadingBlock label="Loading trend data…" /> : <AccuracyErrorChart data={trend} />}
        </Card>

        <Card eyebrow="Recent sessions" title="Analysis history">
          <SessionList
            sessions={sessions || []}
            isLoading={sessionsLoading}
            activeId={activeSessionId}
            onSelect={setActiveSessionId}
          />
        </Card>
      </div>

      <AIFeedbackPanel feedback={feedback} isLoading={feedbackLoading} />

      <div className="grid-2">
        <VideoUploadPanel />
        <AIChatPanel />
      </div>
    </div>
  );
}
