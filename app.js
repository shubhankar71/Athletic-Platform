const state = {
  role: 'athlete',
  sportFilter: 'all',
  chatHistory: [],
  savedOpportunities: new Set(),
};

const db = {
  athlete: {
    name: 'Jordan Reyes',
    sport: 'Track & Field',
    role: 'Athlete',
  },

  opportunities: [
    {
      id: 'op1', title: 'Regional Sprint Invitational', org: 'Texas Athletics Association',
      type: 'competition', sport: 'track', location: 'Austin, TX', deadline: '2026-09-12',
      description: 'Open qualifier for sub-elite 100m/200m/400m sprinters. Top 3 in each heat advance to state finals.',
    },
    {
      id: 'op2', title: 'Collegiate Recruitment Combine', org: 'State University Athletics',
      type: 'recruitment', sport: 'track', location: 'College Station, TX', deadline: '2026-08-30',
      description: 'Coaches from 14 D1 programs will be scouting sprint and jump events. Bring verified times.',
    },
    {
      id: 'op3', title: 'Sprint Mechanics Workshop', org: 'Vantage Performance Lab',
      type: 'workshop', sport: 'track', location: 'Online', deadline: '2026-08-20',
      description: 'Two-hour session on start acceleration and drive-phase posture, led by a biomechanics coach.',
    },
    {
      id: 'op4', title: 'Fall Swim Classic', org: 'Lonestar Aquatics',
      type: 'competition', sport: 'swimming', location: 'Houston, TX', deadline: '2026-09-05',
      description: 'Long-course meet across all strokes, sanctioned for regional qualifying times.',
    },
  ],

  athletes: [
    { id: 'a1', name: 'Jordan Reyes', sport: 'track', position: '400m Sprinter', accuracy: 92, sessions: 14, pr: '47.82s' },
    { id: 'a2', name: 'Maya Okafor', sport: 'swimming', position: '200m Freestyle', accuracy: 88, sessions: 21, pr: '1:58.4' },
    { id: 'a3', name: 'Diego Salinas', sport: 'basketball', position: 'Point Guard', accuracy: 79, sessions: 9, pr: '6.2 ast/g' },
    { id: 'a4', name: 'Priya Nair', sport: 'soccer', position: 'Midfielder', accuracy: 85, sessions: 17, pr: '3.4 km/h avg' },
    { id: 'a5', name: 'Ethan Cole', sport: 'track', position: 'Long Jump', accuracy: 90, sessions: 12, pr: '7.21m' },
    { id: 'a6', name: 'Sofia Marin', sport: 'swimming', position: '100m Butterfly', accuracy: 94, sessions: 26, pr: '58.9s' },
  ],

  reviews: [
    { id: 'r1', athlete: 'Jordan Reyes', note: 'Start reaction improved 0.04s since last review.', status: 'complete' },
    { id: 'r2', athlete: 'Diego Salinas', note: 'Crossover dribble footwork flagged for uneven weight transfer.', status: 'flagged' },
    { id: 'r3', athlete: 'Priya Nair', note: 'First touch consistency up across drills 3 and 4.', status: 'complete' },
    { id: 'r4', athlete: 'Ethan Cole', note: 'Awaiting new footage — takeoff angle unclear in last upload.', status: 'pending' },
  ],

  reports: [
    { id: 'rep1', user: 'anon_user482', reason: 'Impersonating a verified coach account', resolved: false },
    { id: 'rep2', user: 'trackfan_22', reason: 'Spam links posted in opportunity comments', resolved: false },
    { id: 'rep3', user: 'coach_delacruz', reason: 'Duplicate profile reported by athlete', resolved: true },
  ],

  broadcasts: [
    { id: 'b1', message: 'Video analysis now supports slow-motion frame review.', audience: 'all', sentAt: '2026-08-02T10:00:00' },
  ],
};

const errorTypes = [
  { name: 'Knee drive angle', color: 'var(--accent-danger)' },
  { name: 'Arm swing symmetry', color: 'var(--accent-secondary)' },
  { name: 'Trunk lean', color: 'var(--accent-primary)' },
];

document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initDropzone();
  initChat();
  initFilterBar();
  initOpportunityModal();
  initBroadcastForm();

  renderOpportunityFeed();
  renderAthleteGrid();
  renderReviewList();
  renderReportList();
  renderBroadcastHistory();
});

// ---------------------------------------------------------------------------
// Login / role selection
// ---------------------------------------------------------------------------

const roleCopy = {
  athlete: {
    title: 'Athlete Dashboard',
    subtitle: 'Your performance, feedback, and opportunities in one place.',
    name: 'Jordan Reyes',
    roleLabel: 'Athlete · Track & Field',
    initials: 'JR',
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M13 3L4 14h6l-1 7 9-11h-6l1-7z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  },
  coach: {
    title: 'Coach Dashboard',
    subtitle: 'Track your roster, review footage, and post new opportunities.',
    name: 'Coach Delacruz',
    roleLabel: 'Coach · State University',
    initials: 'CD',
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M9 11a4 4 0 100-8 4 4 0 000 8zM3 21v-1a6 6 0 016-6h0M17 11a3 3 0 100-6 3 3 0 000 6zm-1 3.13A6 6 0 0121 20v1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  admin: {
    title: 'Admin Console',
    subtitle: 'Moderate reports and broadcast platform-wide updates.',
    name: 'Platform Admin',
    roleLabel: 'Administrator',
    initials: 'PA',
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2l8 3.5v5.6c0 5-3.4 8.7-8 10.9-4.6-2.2-8-5.9-8-10.9V5.5L12 2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  },
};

function initLogin() {
  document.querySelectorAll('.login-option').forEach((btn) => {
    btn.addEventListener('click', () => login(btn.dataset.role));
  });

  document.getElementById('logoutBtn').addEventListener('click', logout);
}

function login(role) {
  document.getElementById('loginScreen').hidden = true;
  document.getElementById('app').hidden = false;
  setRole(role);
}

function logout() {
  closeOpportunityModal();
  document.getElementById('app').hidden = true;
  document.getElementById('loginScreen').hidden = false;
}

function setRole(role) {
  state.role = role;

  closeOpportunityModal();

  document.querySelectorAll('.view').forEach((view) => {
    view.classList.toggle('is-active', view.dataset.view === role);
  });

  const copy = roleCopy[role];
  document.getElementById('viewTitle').textContent = copy.title;
  document.getElementById('viewSubtitle').textContent = copy.subtitle;
  document.getElementById('sidebarUserName').textContent = copy.name;
  document.getElementById('sidebarUserRole').textContent = copy.roleLabel;
  document.querySelector('.mini-profile__avatar').textContent = copy.initials;
  document.querySelector('.topbar .avatar--sm').textContent = copy.initials;
  document.getElementById('activeRoleValue').textContent = copy.roleLabel.split(' ·')[0];
  document.getElementById('activeRoleIcon').innerHTML = copy.icon;
}

// ---------------------------------------------------------------------------
// Athlete — video dropzone + canvas analysis
// ---------------------------------------------------------------------------

function initDropzone() {
  const zone = document.getElementById('dropzone');
  const input = document.getElementById('videoInput');

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
  });

  ['dragenter', 'dragover'].forEach((evt) => {
    zone.addEventListener(evt, (e) => { e.preventDefault(); zone.classList.add('is-dragover'); });
  });

  ['dragleave', 'drop'].forEach((evt) => {
    zone.addEventListener(evt, (e) => { e.preventDefault(); zone.classList.remove('is-dragover'); });
  });

  zone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file) handleVideoUpload(file);
  });

  input.addEventListener('change', () => {
    if (input.files[0]) handleVideoUpload(input.files[0]);
  });
}

function handleVideoUpload(file) {
  const zone = document.getElementById('dropzone');
  zone.querySelector('.dropzone__title').textContent = 'Analyzing footage…';
  zone.querySelector('.dropzone__hint').textContent = file.name;

  // TODO: replace with fetch('/api/analysis/upload', { method: 'POST', body: formData })
  setTimeout(() => {
    zone.classList.add('is-uploaded');
    zone.querySelector('.dropzone__title').textContent = 'Analysis complete';
    zone.querySelector('.dropzone__hint').textContent = `${file.name} · re-drop to analyze another clip`;
    runAnalysis();
  }, 1200);
}

function runAnalysis() {
  const accuracy = 88;
  const errors = [
    { ...errorTypes[0], pct: 6 },
    { ...errorTypes[1], pct: 4 },
    { ...errorTypes[2], pct: 2 },
  ];

  document.getElementById('analysisResult').hidden = false;
  drawAccuracyChart(accuracy, errors);

  const list = document.getElementById('errorList');
  list.innerHTML = errors.map((err) => `
    <li>
      <span class="error-list__dot" style="background:${err.color}"></span>
      <span class="error-list__name">${err.name}</span>
      <span class="error-list__pct">${err.pct}%</span>
    </li>
  `).join('');

  document.getElementById('feedbackText').textContent =
    'Drive phase mechanics are solid overall. Knee drive angle drops slightly after the 30m mark, which is likely costing you top-end speed. Focus drills on maintaining shin angle through the acceleration zone.';
}

function drawAccuracyChart(accuracy, errors) {
  const canvas = document.getElementById('accuracyChart');
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = 78;
  const lineWidth = 16;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = lineWidth;
  ctx.stroke();

  let start = -Math.PI / 2;
  const segments = [{ pct: accuracy, color: '#35d07f' }, ...errors.map((e) => ({ pct: e.pct, color: e.color }))];

  segments.forEach((seg) => {
    const sweep = (seg.pct / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, start, start + sweep);
    ctx.strokeStyle = seg.color.startsWith('var') ? getComputedColor(seg.color) : seg.color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'butt';
    ctx.stroke();
    start += sweep;
  });

  let current = 0;
  const target = accuracy;
  const counter = document.getElementById('chartCenterValue');
  const tick = () => {
    current += 4;
    if (current >= target) { counter.textContent = `${target}%`; return; }
    counter.textContent = `${current}%`;
    requestAnimationFrame(tick);
  };
  tick();
}

function getComputedColor(varExpr) {
  const name = varExpr.match(/--[\w-]+/)[0];
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

// ---------------------------------------------------------------------------
// Athlete — mock chat
// ---------------------------------------------------------------------------

function initChat() {
  const form = document.getElementById('chatForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    appendChatMessage('user', text);
    input.value = '';

    // TODO: replace with fetch('/api/analysis/chat', { method: 'POST', body: JSON.stringify({ message: text }) })
    setTimeout(() => appendChatMessage('ai', generateMockReply(text)), 700);
  });
}

function appendChatMessage(sender, text) {
  const log = document.getElementById('chatLog');
  const bubble = document.createElement('div');
  bubble.className = `chat-msg chat-msg--${sender}`;
  bubble.textContent = text;
  log.appendChild(bubble);
  log.scrollTop = log.scrollHeight;
  state.chatHistory.push({ sender, text });
}

function generateMockReply(question) {
  const q = question.toLowerCase();
  if (q.includes('knee')) return 'Your knee drive angle averages 62° through drive phase, about 8° short of your target range — that\'s the main flag on this clip.';
  if (q.includes('arm')) return 'Arm swing symmetry looks close between sides, with a slight lag on your left recovery arm past 150ms into each stride cycle.';
  if (q.includes('improve') || q.includes('fix')) return 'Try wall drills focused on high knee drive with a resistance band, 3 sets of 8, before your next sprint session.';
  return 'Good question — based on this clip, your biggest opportunity is stabilizing knee drive angle after the 30m mark. Want a drill recommendation?';
}

// ---------------------------------------------------------------------------
// Athlete — opportunity feed
// ---------------------------------------------------------------------------

function renderOpportunityFeed() {
  const container = document.getElementById('opportunityFeed');
  container.innerHTML = db.opportunities.map((opp) => `
    <article class="opportunity-card">
      <div class="opportunity-card__head">
        <h4>${opp.title}</h4>
        <span class="tag tag--${typeTagStyle(opp.type)}">${opp.type}</span>
      </div>
      <p class="opportunity-card__org">${opp.org} · ${opp.location}</p>
      <p class="opportunity-card__desc">${opp.description}</p>
      <div class="opportunity-card__foot">
        <span class="opportunity-card__deadline">Deadline ${formatDate(opp.deadline)}</span>
        <button class="save-btn ${state.savedOpportunities.has(opp.id) ? 'is-saved' : ''}" data-save="${opp.id}" aria-label="Save opportunity">
          <svg viewBox="0 0 24 24" fill="${state.savedOpportunities.has(opp.id) ? 'currentColor' : 'none'}"><path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('[data-save]').forEach((btn) => {
    btn.addEventListener('click', () => toggleSaveOpportunity(btn.dataset.save));
  });
}

function toggleSaveOpportunity(id) {
  if (state.savedOpportunities.has(id)) state.savedOpportunities.delete(id);
  else state.savedOpportunities.add(id);
  renderOpportunityFeed();
}

function typeTagStyle(type) {
  if (type === 'competition') return 'accent';
  if (type === 'recruitment') return 'warn';
  return 'success';
}

function formatDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ---------------------------------------------------------------------------
// Coach — filter bar + roster
// ---------------------------------------------------------------------------

function initFilterBar() {
  document.getElementById('sportFilterBar').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    document.querySelectorAll('.chip').forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    state.sportFilter = chip.dataset.sport;
    renderAthleteGrid();
  });
}

function renderAthleteGrid() {
  const container = document.getElementById('athleteGrid');
  const list = state.sportFilter === 'all'
    ? db.athletes
    : db.athletes.filter((a) => a.sport === state.sportFilter);

  if (!list.length) {
    container.innerHTML = `<p style="color:var(--text-tertiary);font-size:13px;">No athletes in this sport yet.</p>`;
    return;
  }

  container.innerHTML = list.map((a) => `
    <div class="athlete-card">
      <div class="athlete-card__head">
        <span class="avatar avatar--sm">${initials(a.name)}</span>
        <div>
          <h4>${a.name}</h4>
          <p>${a.position}</p>
        </div>
      </div>
      <div class="athlete-card__stats">
        <div class="mini-stat"><span class="mini-stat__value">${a.accuracy}%</span><span class="mini-stat__label">Accuracy</span></div>
        <div class="mini-stat"><span class="mini-stat__value">${a.sessions}</span><span class="mini-stat__label">Sessions</span></div>
        <div class="mini-stat"><span class="mini-stat__value">${a.pr}</span><span class="mini-stat__label">Best</span></div>
      </div>
      <div class="athlete-card__foot">
        <span class="tag tag--accent">${a.sport}</span>
        <button class="btn btn--ghost btn--sm">View Report</button>
      </div>
    </div>
  `).join('');
}

function initials(name) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function renderReviewList() {
  const statusStyle = { complete: 'success', flagged: 'danger', pending: 'warn' };
  const container = document.getElementById('reviewList');
  container.innerHTML = db.reviews.map((r) => `
    <div class="review-item">
      <div class="review-item__thumb">
        <svg viewBox="0 0 24 24" fill="none"><path d="M15 10l5-3v10l-5-3M4 6h10a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
      </div>
      <div class="review-item__body">
        <h5>${r.athlete}</h5>
        <p>${r.note}</p>
      </div>
      <span class="tag tag--${statusStyle[r.status]}">${r.status}</span>
    </div>
  `).join('');
}

// ---------------------------------------------------------------------------
// Coach — post opportunity modal
// ---------------------------------------------------------------------------

function openOpportunityModal() {
  document.getElementById('opportunityModalOverlay').hidden = false;
  document.getElementById('oppTitle').focus();
}

function closeOpportunityModal() {
  const overlay = document.getElementById('opportunityModalOverlay');
  if (overlay.hidden) return;
  overlay.hidden = true;
  document.getElementById('opportunityForm').reset();
}

function initOpportunityModal() {
  const overlay = document.getElementById('opportunityModalOverlay');

  document.getElementById('openOpportunityModal').addEventListener('click', openOpportunityModal);
  document.getElementById('closeOpportunityModal').addEventListener('click', closeOpportunityModal);
  document.getElementById('cancelOpportunityModal').addEventListener('click', closeOpportunityModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOpportunityModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) closeOpportunityModal(); });

  document.getElementById('opportunityForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const newOpp = {
      id: `op${Date.now()}`,
      title: document.getElementById('oppTitle').value,
      type: document.getElementById('oppType').value,
      sport: document.getElementById('oppSport').value,
      location: document.getElementById('oppLocation').value,
      deadline: document.getElementById('oppDeadline').value,
      description: document.getElementById('oppDescription').value,
      org: 'State University Athletics',
    };

    // TODO: replace with fetch('/api/opportunities', { method: 'POST', body: JSON.stringify(newOpp) })
    db.opportunities.unshift(newOpp);
    renderOpportunityFeed();
    closeOpportunityModal();
    showToast('Opportunity published to the athlete feed.');
  });
}

// ---------------------------------------------------------------------------
// Admin — reports + broadcasts
// ---------------------------------------------------------------------------

function renderReportList() {
  const container = document.getElementById('reportList');
  const open = db.reports.filter((r) => !r.resolved).length;
  document.getElementById('reportCount').textContent = `${open} open`;

  container.innerHTML = db.reports.map((r) => `
    <div class="report-item ${r.resolved ? 'is-resolved' : ''}">
      <div class="report-item__head">
        <h5>${r.user}</h5>
        <span class="tag tag--${r.resolved ? 'success' : 'danger'}">${r.resolved ? 'resolved' : 'open'}</span>
      </div>
      <p class="report-item__reason">${r.reason}</p>
      ${r.resolved ? '' : `
        <div class="report-item__actions">
          <button class="btn btn--ghost btn--sm" data-dismiss="${r.id}">Dismiss</button>
          <button class="btn btn--primary btn--sm" data-suspend="${r.id}">Suspend User</button>
        </div>
      `}
    </div>
  `).join('');

  container.querySelectorAll('[data-dismiss]').forEach((btn) => {
    btn.addEventListener('click', () => resolveReport(btn.dataset.dismiss, 'Report dismissed.'));
  });
  container.querySelectorAll('[data-suspend]').forEach((btn) => {
    btn.addEventListener('click', () => resolveReport(btn.dataset.suspend, 'User suspended.'));
  });
}

function resolveReport(id, message) {
  // TODO: replace with fetch(`/api/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ resolved: true }) })
  const report = db.reports.find((r) => r.id === id);
  if (report) report.resolved = true;
  renderReportList();
  showToast(message);
}

function initBroadcastForm() {
  document.getElementById('broadcastForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const message = document.getElementById('broadcastMessage').value.trim();
    const audience = document.getElementById('broadcastAudience').value;
    if (!message) return;

    // TODO: replace with fetch('/api/admin/broadcasts', { method: 'POST', body: JSON.stringify({ message, audience }) })
    db.broadcasts.unshift({ id: `b${Date.now()}`, message, audience, sentAt: new Date().toISOString() });
    renderBroadcastHistory();
    e.target.reset();
    showToast('Broadcast sent.');
  });
}

function renderBroadcastHistory() {
  const list = document.getElementById('broadcastHistory');
  list.innerHTML = db.broadcasts.map((b) => `
    <li>
      ${b.message}
      <time>${new Date(b.sentAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} · ${b.audience}</time>
    </li>
  `).join('');
}

// ---------------------------------------------------------------------------
// Shared — toast
// ---------------------------------------------------------------------------

let toastTimer;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
}