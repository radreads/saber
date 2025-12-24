# Saber - Moneyball Dashboard

## Project Overview

Saber is a learning-focused web app that teaches how full-stack applications work by building an interactive baseball analytics dashboard. Users can search for MLB players, view game logs, and explore advanced sabermetrics (wOBA, FIP, OPS+) with full transparency into the data pipeline.

**Primary Goal:** Help beginners understand the complete flow: UI → server route → external API → data transform → metric computation → render → debug.

## Tech Stack

- **Framework:** Next.js (App Router) + React + TypeScript
- **Backend:** Next.js API Routes (server-side proxying)
- **Data Source:** MLB Stats API (unofficial public endpoints)
- **Caching:** In-memory (dev), Vercel edge cache or Upstash Redis (prod)
- **Deployment:** Vercel

## Project Structure (Planned)

```
saber/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home/search page
│   │   └── [playerId]/         # Player dashboard
│   ├── api/                    # API route handlers
│   │   ├── searchPlayers/
│   │   ├── playerOverview/
│   │   ├── gameLogs/
│   │   └── metrics/
│   ├── lib/                    # Core logic
│   │   ├── mlb-api.ts          # MLB Stats API client
│   │   ├── transform.ts        # Raw JSON → internal model
│   │   ├── metrics.ts          # wOBA, FIP, OPS+ calculations
│   │   └── cache.ts            # Caching layer
│   └── components/             # React components
│       ├── PlayerSearch/
│       ├── Dashboard/
│       ├── GameLogTable/
│       ├── MetricsTiles/
│       ├── MetricExplainer/
│       └── Charts/
├── prd.md                      # Product requirements document
├── readme.md
└── package.json
```

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run linter
npm run test         # Run tests (when added)
```

## Key Concepts

### Data Flow
1. Client calls internal API route (e.g., `/api/searchPlayers`)
2. Server proxies request to MLB Stats API
3. Server transforms raw JSON into stable internal schema
4. Server computes metrics (wOBA, FIP, OPS+)
5. Server caches result (TTL 1-6 hours)
6. Client renders dashboard with metadata

### Core Metrics
- **wOBA (hitters):** Weighted On-Base Average using year-specific weights
- **FIP (pitchers):** Fielding Independent Pitching with league constants
- **OPS+ (both):** Normalized stat where 100 = league average

### Design Rules
- Never compute metrics directly from raw API JSON in the UI
- Always: transform → validate → compute on server
- All API routes return: `{ data, meta: { requestId, cache, sourceLatencyMs } }`

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Keep components small and focused
- Separate data fetching from rendering logic
- Include error handling with graceful degradation

### API Routes
- Proxy all external API calls through server routes
- Include caching headers and TTL
- Return structured responses with metadata
- Handle rate limiting with backoff

### Testing Approach
- Write unit tests for metric calculations (wOBA, FIP formulas)
- Test data transformations with sample API responses
- Validate edge cases (missing fields, partial data)

## V1 Roadmap

1. [ ] Player search + overview page
2. [ ] Game logs table + caching
3. [ ] wOBA computation + explain mode
4. [ ] FIP computation + explain mode
5. [ ] Rolling charts + UI polish
6. [ ] Deploy + analytics + error logging

## Edge Cases to Handle

- Missing SF/IBB fields in API data
- Doubleheaders and partial games
- Pitchers with very few innings (noisy stats)
- Players traded mid-season
- V1 scope: Regular season only (no postseason)

## Resources

- [PRD](./prd.md) - Full product requirements
- [FanGraphs wOBA](https://library.fangraphs.com/offense/woba/) - wOBA explanation
- [FanGraphs FIP](https://library.fangraphs.com/pitching/fip/) - FIP explanation
- [MLB Glossary](https://www.mlb.com/glossary) - Official stat definitions

## Environment Variables

```bash
# Add to .env.local (not committed)
# MLB_API_BASE_URL=...     # If using authenticated endpoints
# UPSTASH_REDIS_URL=...    # For production caching (optional)
```
