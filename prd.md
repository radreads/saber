# PRD: Moneyball Dashboard (Sabermetrics + Vibe-Coding “Nuts & Bolts”)

## 1) Summary
**Moneyball Dashboard** is a web app that lets a beginner pick a hitter or pitcher, choose a season or date range, and view:
- clean **game logs + season splits**
- computed sabermetrics (**wOBA** for hitters, **FIP** for pitchers, **OPS+** as a normalized “100 = league average” anchor)
- simple charts + “explain this metric” panels

The app is deliberately designed to teach “how vibe-coded apps actually work” by exposing the full pipeline:
UI → server route → external data fetch → transform → derived metrics → render → debug.

## 2) Problem
As a newbie, you can get AI to generate code, but it’s hard to understand:
- where data comes from
- what runs on the client vs server
- why a metric is wrong (NaN, missing fields, wrong denominators)
- how to structure code so you can modify it confidently

Sabermetrics adds a second learning layer: turning raw events into meaningful, testable formulas (and handling year/league context).

## 3) Goals (V1)
### Product goals
1. Make it easy to pull MLB player data and view understandable dashboards.
2. Compute and explain 3 core advanced stats:
   - **wOBA** (hitters) :contentReference[oaicite:0]{index=0}
   - **FIP** (pitchers) :contentReference[oaicite:1]{index=1}
   - **OPS+** (contextual index) :contentReference[oaicite:2]{index=2}
3. Provide “learning affordances”: show raw JSON, formula breakdowns, and debugging logs.

### Learning goals (explicit)
- Understand client/server boundaries, API routes, caching, error handling, env vars, deploy.
- Practice transforming JSON into a stable internal model.
- Validate formulas with tiny test cases.

## 4) Non-goals (V1)
- Real-time pitch-by-pitch visualizations
- Pro scouting tools, projections, or predictive modeling
- Commercial resale/redistribution of MLB data
- Full historical completeness for every league/era

## 5) Users & Use Cases
### Primary persona
**Beginner vibe-coder** who wants a fun project that forces them to understand:
- fetch → transform → compute → render → debug

### Core use cases
1. “Search a player, show their last 30 games.”
2. “For a hitter: calculate wOBA and show a breakdown of events + weights.”
3. “For a pitcher: calculate FIP and chart rolling FIP over last N starts.”
4. “Explain why OPS+ is ‘100 = average’ and show how the index changes with context.”

## 6) Success Metrics
- **Activation:** user completes “search → dashboard load” within 60 seconds on first use.
- **Reliability:** <1% of requests result in hard errors (500) during normal usage.
- **Performance:** dashboard renders in <2 seconds (p50) after cache warm.
- **Learning:** “Explain mode” used by >50% of sessions (toggle events).

## 7) Data Sources & Constraints
### Primary data source
- **MLB Stats API (unofficial/publicly accessible endpoints)** for schedules, players, game logs, stats.
  - Some official MLB API docs exist behind login. :contentReference[oaicite:3]{index=3}
  - Community endpoint references are widely used for discovery. :contentReference[oaicite:4]{index=4}

### Legal/terms note (product requirement)
- Use must respect MLB’s Terms of Use for MLB services/content. :contentReference[oaicite:5]{index=5}
- V1 is designed for **personal learning / low-volume** usage, not bulk scraping or redistribution.

## 8) Scope (V1 Features)

### 8.1 Player search + selection
- Search by name; show results list with headshot (optional), team, position.
- Select player → open dashboard.

**Acceptance criteria**
- Searching “Ohtani” returns multiple results and selecting one loads a dashboard.

### 8.2 Dashboard: Overview
- Header: player name, team, position, season/year picker, date-range picker.
- Quick tiles:
  - Hitters: PA, HR, BB, K, AVG/OBP/SLG, wOBA
  - Pitchers: IP, HR, BB, K, ERA, FIP

### 8.3 Game logs table
- Default: last 30 games
- Sortable columns (date, opponent, key stats)
- Row click opens “game detail” drawer (optional in V1)

### 8.4 Metric computation + explain panels
#### wOBA (hitters)
- Inputs: BB (exclude IBB if available), HBP, 1B, 2B, 3B, HR, AB, SF
- Uses year-specific weights (configure by season; start with one season, then expand).
- UI shows:
  - formula
  - each component’s contribution
  - final numerator/denominator

FanGraphs explanation + usage references. :contentReference[oaicite:6]{index=6}

#### FIP (pitchers)
- Inputs: HR, BB, HBP, K, IP (and optionally IBB exclusion)
- FIP includes a league/year constant to scale to ERA-like values. :contentReference[oaicite:7]{index=7}
- V1 options:
  - **Simple mode:** show “FIP (no constant)” + explain that constant depends on league/year
  - **Accurate mode:** allow user to pick season constant from a small config table you maintain

#### OPS+ (index)
- Display definition and interpretation (100 = league average). :contentReference[oaicite:8]{index=8}
- V1 approach:
  - If you can fetch league/park factors cleanly, compute it.
  - Otherwise, show OPS+ when available from the API OR ship “Simplified OPS Index” that normalizes vs league-average OBP/SLG.

### 8.5 Charts
- Rolling charts:
  - Hitter: rolling wOBA (last 15 games)
  - Pitcher: rolling FIP (last 5 starts)
- Hover tooltip shows game date + raw inputs.

### 8.6 Learning Mode (the “nuts & bolts” feature)
A toggle that reveals:
- “Raw API JSON” (collapsed view + copy button)
- “Transform output” (your normalized internal model)
- “Formula breakdown” (step-by-step)
- “Debug log” (client + server logs)

**Acceptance criteria**
- Any metric tile can be expanded to see its inputs and formula steps.

## 9) Non-Functional Requirements
- **Performance:** Use caching (server-side) with a TTL (e.g., 1–6 hours).
- **Rate limiting:** Basic per-IP throttling on API routes.
- **Observability:** structured logs (request id, endpoint, latency, cache hit/miss).
- **Resilience:** graceful degradation (show base stats even if advanced metric fails).
- **Security:** no secrets on client; env vars only on server routes.

## 10) System Design (V1)
### Recommended stack
- Next.js (App Router) + React
- API Routes (`/api/*`) to proxy MLB requests
- Simple cache:
  - In-memory (dev) + Vercel/edge cache patterns (prod) OR Upstash Redis (optional)

### Data flow
1. Client calls `/api/player-search?q=...`
2. Server route calls MLB Stats API, normalizes response
3. Client selects player → calls `/api/player-dashboard?playerId=...&range=...`
4. Server aggregates:
   - player info
   - season stats
   - game logs
5. Server transforms into internal schema
6. Client renders dashboard and charts

## 11) Internal Data Model (normalized)
### Entities
- `Player`: { id, name, team, position, bats/throws }
- `GameLogRow`: { gameId, date, opponent, homeAway, hitterStats?, pitcherStats? }
- `HitterInputs`: { BB, IBB?, HBP, 1B, 2B, 3B, HR, AB, SF, PA }
- `PitcherInputs`: { HR, BB, IBB?, HBP, K, IP }
- `ComputedMetrics`: { wOBA?, FIP?, OPSPlus? }
- `ExplainPacket`: { metricName, inputs, weights/constants, steps[], notes[] }

### Design rule
**Never compute directly off raw API JSON in the UI.**
Always transform → validate → compute.

## 12) API Routes (internal)
- `GET /api/searchPlayers?q=`
- `GET /api/playerOverview?playerId=&season=`
- `GET /api/gameLogs?playerId=&season=&range=`
- `GET /api/metrics?hitter|pitcher inputs...` (optional; can be internal function instead)

**Requirements**
- All routes return `{ data, meta: { requestId, cache, sourceLatencyMs } }`

## 13) Edge Cases & Data Quality
- Missing SF/IBB fields → fall back to best available; flag in Explain notes.
- Doubleheaders / partial games
- Pitchers with tiny IP leading to noisy rates
- Players traded mid-season (team changes)
- Postseason vs regular season toggles (V1: regular season only)

## 14) UX / Screens (V1)
1. **Home**
   - Search box
   - Recent players (localStorage)
2. **Player Dashboard**
   - Header + controls (season/date range)
   - Tiles (base + advanced)
   - Game logs table
   - Rolling chart
   - Explain drawers per metric
3. **About / Methods**
   - Short explanation of data source + terms pointer
   - Metric references (FanGraphs + MLB glossary) :contentReference[oaicite:9]{index=9}

## 15) Analytics (basic)
Track events:
- `search_submitted`, `player_selected`
- `dashboard_loaded` (with latency)
- `metric_explain_opened`
- `raw_json_copied`
- `error_shown` (with code)

## 16) Risks & Mitigations
- **Upstream API changes** → isolate with server proxy + normalization layer.
- **Rate limiting / blocking** → caching + low volume; add backoff.
- **Metric correctness disputes** → show formula, inputs, and cite references. :contentReference[oaicite:10]{index=10}
- **Legal/terms concerns** → keep scope personal/learning; avoid redistribution/bulk. :contentReference[oaicite:11]{index=11}

## 17) Milestones (suggested)
1. Player search + overview page
2. Game logs table + caching
3. wOBA (inputs + explain mode)
4. FIP (inputs + explain mode)
5. Rolling charts + UI polish
6. Deploy + analytics + error logging

## 18) Acceptance Criteria (V1 “Done”)
- A user can search and load a player in <60 seconds.
- Dashboard shows last 30 games + basic stats reliably.
- wOBA and FIP compute for common players with explainable breakdowns.
- OPS+ shown as definition + either computed or sourced/approximated with clear labeling.
- Learning Mode reveals raw JSON + normalized model + calculation steps.
- App deployed and usable publicly (or privately) with caching + basic throttling.

## 19) Open Questions (for V2)
- Do we want to support multiple seasons and year-specific wOBA weights by default? :contentReference[oaicite:12]{index=12}
- Should FIP include season constants out of the box (accuracy) vs “no constant” (simplicity)? :contentReference[oaicite:13]{index=13}
- Do we compute OPS+ ourselves or only display if available? :contentReference[oaicite:14]{index=14}
- Should users be able to compare two players side-by-side?
