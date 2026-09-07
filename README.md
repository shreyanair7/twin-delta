# Market Memory Watch

Build DELTA — a stock watchlist app with "Market Memory": it compares current 

market prices against what the user last saw, not just daily change.

Stack: Next.js, TypeScript, Tailwind, shadcn/ui, Supabase (Postgres + Auth + 

RLS + Realtime), Zod, TanStack Query.

For this first pass, build only the foundation — no fake data, no placeholder 

logic for anything you do build:

1. Supabase schema with tables: profiles, watchlists, watchlist_stocks 

   (unique constraint on watchlist_id+symbol), market_prices (append-only, 

   indexed on symbol+market_timestamp), user_market_snapshots (immutable), 

   snapshot_stock_states, detected_changes, user_feedback, market_events.

2. Row Level Security so users only see their own profiles/watchlists/

   snapshots/changes/feedback. Market data can be broadly readable.

3. Auth: signup/login/logout/session persistence, working end to end.

4. Watchlist CRUD: create/rename/delete watchlists, add/remove/search stocks, 

   switch between watchlists — all persisted to Postgres, not local state.

5. Dark, premium fintech UI (near-black background, restrained teal/green 

   accents, generous whitespace) — but only for the screens above. No 

   dashboard logic yet.

Do not implement the Meaningfulness Engine, realtime, or demo simulator yet — 

that's the next phase. Confirm each piece actually writes to and reads from 

Supabase before considering it done.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0d238ac1-5b2a-4112-a9c4-4970795ff863).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
