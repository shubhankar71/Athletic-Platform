# FieldSignal — Athletic Social Platform (Frontend Prototype)

Frontend-only presentation prototype for a LinkedIn-style athletic social
platform. Built as the long-term foundational codebase — structured so the
mock API layer is the only thing that needs to change when the FastAPI
backend comes online.

## Stack

- React 18 + Vite
- Recharts (accuracy/error trend charts)
- lucide-react (icons)
- Plain CSS with a token system (`src/styles/tokens.css`) — no UI kit

## Getting started

```bash
npm install
npm run dev
```

## Architecture

```
src/
  api/mockApi.js         All "network" calls. Every function here mimics a
                          FastAPI response: async, latency-simulated, typed
                          payload shape. Components only ever import from
                          here — never from data/mockData.js directly.
                          Swapping to a real backend means editing ONLY
                          this file (fetch() calls in place of resolveAfter()).

  data/mockData.js        Static fixtures used by mockApi.js.

  hooks/useAsyncData.js   Generic { data, isLoading, error, refetch } hook,
                          the same shape you'd get from react-query. Used by
                          every data-driven component so loading/error UI
                          keeps working unchanged after the backend swap.

  context/RoleContext.jsx Owns which dashboard is active (Athlete / Coach /
                          Admin). Currently a free client-side switch for
                          demo purposes — swap for real auth/session state
                          later; nothing downstream changes since all
                          consumers read from this context.

  components/
    ui/                   Reusable primitives: Button, Card, Badge, Tabs,
                           LoadingState (spinner + skeleton).
    layout/                Sidebar, AppShell, shared dashboard grid CSS.
    charts/                AccuracyErrorChart (Recharts wrapper).
    athlete/               Athlete dashboard: AI Analysis tab (session list,
                           video upload state machine, feedback panel, mock
                           AI chat) + Opportunity Feed.
    coach/                 Coach dashboard: multi-sport athlete roster with
                           search/filter, athlete profile drawer, opportunity
                           composer + feed.
    admin/                 Admin dashboard: broadcast notifications panel,
                           user report moderation panel.
```

## Design system

Dark, high-contrast "athletic workspace" theme. Tokens live in
`src/styles/tokens.css`:

- **Surfaces**: near-black ground (`--bg-0`) up through raised panels (`--bg-3`)
- **Accents**: mint-teal (`--accent-teal`) for performance/AI data, track-coral
  (`--accent-coral`) for opportunities/energy, plus red/amber signal colors
  for moderation and warnings
- **Type**: Anton (display/headings), Inter (body/UI), JetBrains Mono (stats,
  timestamps, scores)
- **Signature motif**: the "lane-rail" — a three-stripe vertical divider
  echoing a running track's lane markings, used for the active sidebar item
  and available as a `.lane-rail` utility class for future section dividers

## Connecting to FastAPI later

1. Replace the body of each function in `src/api/mockApi.js` with a real
   `fetch(...)` call to the matching endpoint (each function is already
   commented with its intended REST route, e.g. `GET /api/coach/roster`).
2. Delete `src/data/mockData.js` once nothing imports it.
3. Add auth/session handling and derive `role` in `RoleContext.jsx` from the
   authenticated user instead of local `useState`.

No component code should need to change — every data-driven component
already consumes `useAsyncData(fetcher)` rather than touching fixtures
directly.
