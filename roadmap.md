# DELTA roadmap

## Phase 1 — Foundation (done)
- [x] Database schema: profiles, watchlists, watchlist_stocks, market_prices, user_market_snapshots, snapshot_stock_states, detected_changes, user_feedback, market_events, instruments
- [x] Row-level security on every table; market data broadly readable
- [x] Auth: signup / login / logout / session persistence (email + Google)
- [x] Watchlist CRUD persisted to Postgres
- [x] Dark premium fintech design system

## Phase 2 — Post-login product experience (in progress)
- [ ] Authenticated app shell: collapsible sidebar (Overview, Watchlists, Replay, Insights), top bar (search, freshness, notifications, avatar), mobile nav
- [ ] Overview: greeting, "what changed" briefing, attention summary, Needs your attention cards with score + why, pattern section, caught-up section
- [ ] Watchlists page upgrade: rich stock rows, filters (All/Attention/Changed/Stable), polished add-stock search
- [ ] Stock detail drawer: market memory, score breakdown, data confidence
- [ ] Replay page: timeline of what happened while away
- [ ] Insights page: patterns, watchlist summary, attention summary
- [ ] Data reliability components (live / delayed / stale / conflicting)
- [ ] Empty, loading (skeleton) and error states
- [ ] Settings page with Demo Mode panel (clearly separated from production data)
- [ ] Centralized market data service layer + hooks (demo source now, swappable for live)

## Phase 3 — Next (not started)
- [ ] Meaningfulness Engine (server-side scoring writing to detected_changes)
- [ ] Realtime price updates
- [ ] Live market data ingestion into market_prices
