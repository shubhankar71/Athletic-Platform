import {
  ACCURACY_ERROR_TREND,
  AI_FEEDBACK,
  ANALYSIS_SESSIONS,
  ATHLETE_ROSTER,
  BROADCAST_UPDATES,
  INITIAL_AI_CHAT,
  OPPORTUNITY_POSTS,
  USER_REPORTS,
} from "../data/mockData.js";

// ---------------------------------------------------------------------------
// Every export here mimics a resolved FastAPI response: async, network-shaped
// latency, and a payload matching what the real endpoint should return.
// When the backend exists, this file is the ONLY thing that should change —
// e.g. `export const getAnalysisSessions = () => fetch("/api/analysis").then(r => r.json())`.
// Components should never import from data/mockData.js directly.
// ---------------------------------------------------------------------------

const LATENCY_MS = 650;

function resolveAfter(payload, ms = LATENCY_MS) {
  return new Promise((resolve) => setTimeout(() => resolve(payload), ms));
}

// GET /api/athlete/analysis/sessions
export function getAnalysisSessions() {
  return resolveAfter(ANALYSIS_SESSIONS);
}

// GET /api/athlete/analysis/trend
export function getAccuracyErrorTrend() {
  return resolveAfter(ACCURACY_ERROR_TREND);
}

// GET /api/athlete/analysis/{sessionId}/feedback
export function getAiFeedback() {
  return resolveAfter(AI_FEEDBACK);
}

// GET /api/athlete/analysis/{sessionId}/chat
export function getAiChatThread() {
  return resolveAfter(INITIAL_AI_CHAT, 300);
}

// POST /api/athlete/analysis/{sessionId}/chat  { message }
export function postAiChatMessage(message) {
  const reply = pickAiReply(message);
  return resolveAfter(
    {
      id: `m_${Date.now()}`,
      from: "ai",
      text: reply,
      ts: new Date().toISOString(),
    },
    900
  );
}

function pickAiReply(message) {
  const lower = message.toLowerCase();
  if (lower.includes("drill") || lower.includes("recommend")) {
    return "Try 3x8 wicket drills at reduced spacing, focusing on driving the lead arm forward rather than across your body. That directly targets the arm-drop pattern I flagged.";
  }
  if (lower.includes("fatigue") || lower.includes("tired")) {
    return "The recovery widening after hurdle 7 lines up with a fatigue curve, not a technical flaw — I'd prioritize hurdle-specific conditioning over more technique reps this week.";
  }
  if (lower.includes("score") || lower.includes("why")) {
    return "Your score weighs clearance consistency (40%), contact time (30%), and rhythm stability (30%). The contact-time component is what's holding you back from the low-80s to high-80s range.";
  }
  return "Good question — based on this session, I'd focus there first. Want me to queue up a comparison against your last three sessions?";
}

// POST /api/athlete/analysis/upload  (multipart video)
export function uploadAnalysisVideo() {
  // Simulated multi-stage pipeline: uploading -> processing -> complete
  return resolveAfter({ id: `an_${Date.now()}`, status: "queued" }, 400);
}

// GET /api/coach/roster?sport=&query=
export function getAthleteRoster() {
  return resolveAfter(ATHLETE_ROSTER);
}

// GET /api/opportunities
export function getOpportunityPosts() {
  return resolveAfter(OPPORTUNITY_POSTS);
}

// POST /api/opportunities  { title, type, location, summary }
export function createOpportunityPost(post) {
  return resolveAfter(
    {
      id: `op_${Date.now()}`,
      postedAt: new Date().toISOString(),
      applicants: 0,
      ...post,
    },
    500
  );
}

// GET /api/admin/broadcasts
export function getBroadcastUpdates() {
  return resolveAfter(BROADCAST_UPDATES);
}

// POST /api/admin/broadcasts { title, audience }
export function createBroadcast(broadcast) {
  return resolveAfter(
    {
      id: `bc_${Date.now()}`,
      status: "draft",
      scheduledFor: null,
      ...broadcast,
    },
    450
  );
}

// GET /api/admin/reports
export function getUserReports() {
  return resolveAfter(USER_REPORTS);
}

// PATCH /api/admin/reports/{id} { status }
export function updateReportStatus(id, status) {
  return resolveAfter({ id, status }, 350);
}
