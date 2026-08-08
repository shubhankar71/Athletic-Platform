// ---------------------------------------------------------------------------
// Mock data. Every constant here maps 1:1 to a future FastAPI response shape
// so swapping the mock API layer (see src/api/mockApi.js) for real fetch
// calls should not require reshaping components.
// ---------------------------------------------------------------------------

export const CURRENT_USER_BY_ROLE = {
  athlete: {
    id: "u_ath_01",
    name: "Maya Okonkwo",
    role: "athlete",
    sport: "Track & Field — 400m Hurdles",
    team: "Riverstone Track Club",
    avatarInitials: "MO",
  },
  coach: {
    id: "u_coach_01",
    name: "Daniel Reyes",
    role: "coach",
    title: "Head Coach, Sprints & Hurdles",
    team: "Riverstone Track Club",
    avatarInitials: "DR",
  },
  admin: {
    id: "u_admin_01",
    name: "Priya Shah",
    role: "admin",
    title: "Platform Operations",
    avatarInitials: "PS",
  },
};

// ---- Athlete: AI video analysis sessions -----------------------------------

export const ANALYSIS_SESSIONS = [
  {
    id: "an_001",
    drill: "Hurdle Clearance — Lane 4",
    uploadedAt: "2026-08-06T14:20:00Z",
    status: "complete",
    durationSec: 12,
    overallScore: 82,
  },
  {
    id: "an_002",
    drill: "Start Reaction Block Work",
    uploadedAt: "2026-08-05T09:05:00Z",
    status: "complete",
    durationSec: 8,
    overallScore: 76,
  },
  {
    id: "an_003",
    drill: "Full Race Simulation — 400H",
    uploadedAt: "2026-08-08T07:40:00Z",
    status: "processing",
    durationSec: 58,
    overallScore: null,
  },
];

// Accuracy vs. error trend across an athlete's last sessions.
export const ACCURACY_ERROR_TREND = [
  { session: "S1", accuracy: 61, error: 18 },
  { session: "S2", accuracy: 66, error: 16 },
  { session: "S3", accuracy: 70, error: 14 },
  { session: "S4", accuracy: 74, error: 12 },
  { session: "S5", accuracy: 76, error: 11 },
  { session: "S6", accuracy: 82, error: 8 },
];

export const AI_FEEDBACK = {
  sessionId: "an_001",
  summary:
    "Trail leg mechanics have tightened up since last session — clearance time over hurdles 4-7 is down 0.06s on average. Lead arm drop is the main efficiency loss right now.",
  strengths: [
    "Consistent 8-step rhythm between hurdles 1 through 5",
    "Lead leg snap-down improved 14% vs. previous session",
    "Hip height at takeoff within target band on 7 of 10 clearances",
  ],
  focusAreas: [
    "Lead arm drops below shoulder line on 6 of 10 clearances — costing forward lean",
    "Trail leg recovery widens after hurdle 7, likely fatigue-driven",
    "Contact time on landing is 0.04s longer than target on the far lane",
  ],
  confidence: 0.91,
};

// ---- Athlete: mock AI chat thread ------------------------------------------

export const INITIAL_AI_CHAT = [
  {
    id: "m1",
    from: "ai",
    text: "I've broken down your hurdle clearance session. Lead arm carry is your biggest lever right now — want the drill I'd recommend first?",
    ts: "2026-08-06T14:22:00Z",
  },
];

// ---- Coach: roster & opportunity feed --------------------------------------

export const SPORTS = ["All Sports", "Track & Field", "Swimming", "Basketball", "Soccer"];

export const ATHLETE_ROSTER = [
  {
    id: "u_ath_01",
    name: "Maya Okonkwo",
    sport: "Track & Field",
    event: "400m Hurdles",
    team: "Riverstone Track Club",
    lastSessionScore: 82,
    trend: "up",
    flagged: false,
  },
  {
    id: "u_ath_02",
    name: "Leo Fischer",
    sport: "Swimming",
    event: "200m Butterfly",
    team: "Northshore Aquatics",
    lastSessionScore: 71,
    trend: "down",
    flagged: true,
  },
  {
    id: "u_ath_03",
    name: "Aiko Tanaka",
    sport: "Basketball",
    event: "Point Guard",
    team: "Cedar Hill Prep",
    lastSessionScore: 88,
    trend: "up",
    flagged: false,
  },
  {
    id: "u_ath_04",
    name: "Emeka Obi",
    sport: "Track & Field",
    event: "100m Sprint",
    team: "Riverstone Track Club",
    lastSessionScore: 79,
    trend: "flat",
    flagged: false,
  },
  {
    id: "u_ath_05",
    name: "Sofia Marchetti",
    sport: "Soccer",
    event: "Midfielder",
    team: "Union City FC",
    lastSessionScore: 64,
    trend: "down",
    flagged: true,
  },
];

export const OPPORTUNITY_POSTS = [
  {
    id: "op_001",
    type: "recruitment",
    title: "Walk-on Tryout — Sprints & Hurdles",
    org: "Riverstone Track Club",
    postedBy: "Daniel Reyes",
    postedAt: "2026-08-04T10:00:00Z",
    location: "Riverstone Athletic Complex",
    summary:
      "Open tryout for the fall sprints and hurdles roster. Looking for sub-60s 400H times or equivalent sprint benchmarks.",
    applicants: 14,
  },
  {
    id: "op_002",
    type: "competition",
    title: "Regional Invitational — U18 Track & Field",
    org: "State Athletics Board",
    postedBy: "Daniel Reyes",
    postedAt: "2026-08-02T16:30:00Z",
    location: "Meadowbrook Stadium",
    summary:
      "Qualifying invitational for the state championship series. Entry closes two weeks before the meet date.",
    applicants: 41,
  },
  {
    id: "op_003",
    type: "workshop",
    title: "Block Start Technique Clinic",
    org: "Riverstone Track Club",
    postedBy: "Daniel Reyes",
    postedAt: "2026-07-29T09:00:00Z",
    location: "Riverstone Athletic Complex",
    summary:
      "Half-day clinic on reaction time and drive-phase mechanics, open to club and unattached athletes.",
    applicants: 22,
  },
];

// ---- Admin: broadcasts & reports -------------------------------------------

export const BROADCAST_UPDATES = [
  {
    id: "bc_001",
    title: "Scheduled maintenance — AI analysis pipeline",
    audience: "All users",
    status: "scheduled",
    scheduledFor: "2026-08-10T02:00:00Z",
  },
  {
    id: "bc_002",
    title: "New feature: opportunity applicant tracking",
    audience: "Coaches",
    status: "sent",
    scheduledFor: "2026-08-05T15:00:00Z",
  },
  {
    id: "bc_003",
    title: "Policy update: video retention window",
    audience: "All users",
    status: "draft",
    scheduledFor: null,
  },
];

export const USER_REPORTS = [
  {
    id: "rp_001",
    subject: "Impersonation of a verified coach account",
    reportedUser: "acct_88213",
    reportedBy: "u_ath_02",
    severity: "high",
    status: "open",
    createdAt: "2026-08-07T11:20:00Z",
  },
  {
    id: "rp_002",
    subject: "Spam opportunity postings",
    reportedUser: "acct_44190",
    reportedBy: "u_coach_01",
    severity: "medium",
    status: "in_review",
    createdAt: "2026-08-06T08:05:00Z",
  },
  {
    id: "rp_003",
    subject: "Inappropriate comment on athlete profile",
    reportedUser: "acct_20987",
    reportedBy: "u_ath_04",
    severity: "medium",
    status: "resolved",
    createdAt: "2026-08-03T19:40:00Z",
  },
];
