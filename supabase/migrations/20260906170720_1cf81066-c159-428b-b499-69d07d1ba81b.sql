
-- helpers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.forbid_mutation()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN RAISE EXCEPTION 'Rows in % are immutable', TG_TABLE_NAME; END; $$;

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- instruments (shared reference universe)
CREATE TABLE public.instruments (
  symbol TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  exchange TEXT,
  asset_type TEXT NOT NULL DEFAULT 'equity',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.instruments TO authenticated, anon;
GRANT ALL ON public.instruments TO service_role;
ALTER TABLE public.instruments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "instruments_read_all" ON public.instruments FOR SELECT TO authenticated, anon USING (true);
CREATE INDEX instruments_name_idx ON public.instruments (lower(name));

-- watchlists
CREATE TABLE public.watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 60),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX watchlists_user_name_idx ON public.watchlists (user_id, lower(trim(name)));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.watchlists TO authenticated;
GRANT ALL ON public.watchlists TO service_role;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "watchlists_all_own" ON public.watchlists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER watchlists_updated_at BEFORE UPDATE ON public.watchlists FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- watchlist_stocks
CREATE TABLE public.watchlist_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT watchlist_stocks_unique_symbol UNIQUE (watchlist_id, symbol)
);
CREATE INDEX watchlist_stocks_watchlist_idx ON public.watchlist_stocks (watchlist_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.watchlist_stocks TO authenticated;
GRANT ALL ON public.watchlist_stocks TO service_role;
ALTER TABLE public.watchlist_stocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "watchlist_stocks_all_own" ON public.watchlist_stocks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- market_prices (append-only)
CREATE TABLE public.market_prices (
  id BIGSERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  price NUMERIC(18,6) NOT NULL,
  previous_close NUMERIC(18,6),
  volume BIGINT,
  source TEXT,
  market_timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX market_prices_symbol_ts_idx ON public.market_prices (symbol, market_timestamp DESC);
GRANT SELECT ON public.market_prices TO authenticated, anon;
GRANT ALL ON public.market_prices TO service_role;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "market_prices_read_all" ON public.market_prices FOR SELECT TO authenticated, anon USING (true);
CREATE TRIGGER market_prices_append_only BEFORE UPDATE OR DELETE ON public.market_prices FOR EACH ROW EXECUTE FUNCTION public.forbid_mutation();

-- market_events
CREATE TABLE public.market_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT,
  event_type TEXT NOT NULL,
  headline TEXT NOT NULL,
  body TEXT,
  source TEXT,
  event_timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX market_events_symbol_ts_idx ON public.market_events (symbol, event_timestamp DESC);
GRANT SELECT ON public.market_events TO authenticated, anon;
GRANT ALL ON public.market_events TO service_role;
ALTER TABLE public.market_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "market_events_read_all" ON public.market_events FOR SELECT TO authenticated, anon USING (true);

-- user_market_snapshots (immutable)
CREATE TABLE public.user_market_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  watchlist_id UUID REFERENCES public.watchlists(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX user_market_snapshots_user_idx ON public.user_market_snapshots (user_id, viewed_at DESC);
GRANT SELECT, INSERT ON public.user_market_snapshots TO authenticated;
GRANT ALL ON public.user_market_snapshots TO service_role;
ALTER TABLE public.user_market_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "snapshots_select_own" ON public.user_market_snapshots FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "snapshots_insert_own" ON public.user_market_snapshots FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER snapshots_immutable BEFORE UPDATE OR DELETE ON public.user_market_snapshots FOR EACH ROW EXECUTE FUNCTION public.forbid_mutation();

-- snapshot_stock_states (immutable)
CREATE TABLE public.snapshot_stock_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id UUID NOT NULL REFERENCES public.user_market_snapshots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  price NUMERIC(18,6) NOT NULL,
  market_timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT snapshot_stock_states_unique UNIQUE (snapshot_id, symbol)
);
CREATE INDEX snapshot_stock_states_snapshot_idx ON public.snapshot_stock_states (snapshot_id);
GRANT SELECT, INSERT ON public.snapshot_stock_states TO authenticated;
GRANT ALL ON public.snapshot_stock_states TO service_role;
ALTER TABLE public.snapshot_stock_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "snapshot_states_select_own" ON public.snapshot_stock_states FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "snapshot_states_insert_own" ON public.snapshot_stock_states FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER snapshot_states_immutable BEFORE UPDATE OR DELETE ON public.snapshot_stock_states FOR EACH ROW EXECUTE FUNCTION public.forbid_mutation();

-- detected_changes
CREATE TABLE public.detected_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_id UUID REFERENCES public.user_market_snapshots(id) ON DELETE CASCADE,
  watchlist_id UUID REFERENCES public.watchlists(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  change_type TEXT NOT NULL,
  reference_price NUMERIC(18,6),
  current_price NUMERIC(18,6),
  pct_change NUMERIC(12,6),
  meaningfulness_score NUMERIC(6,3),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMPTZ
);
CREATE INDEX detected_changes_user_idx ON public.detected_changes (user_id, detected_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.detected_changes TO authenticated;
GRANT ALL ON public.detected_changes TO service_role;
ALTER TABLE public.detected_changes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "detected_changes_all_own" ON public.detected_changes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- user_feedback
CREATE TABLE public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  detected_change_id UUID REFERENCES public.detected_changes(id) ON DELETE CASCADE,
  rating TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX user_feedback_user_idx ON public.user_feedback (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_feedback TO authenticated;
GRANT ALL ON public.user_feedback TO service_role;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_feedback_all_own" ON public.user_feedback FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- new user bootstrap
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_list UUID;
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.watchlists (user_id, name, is_default)
  VALUES (NEW.id, 'My Watchlist', true)
  ON CONFLICT DO NOTHING
  RETURNING id INTO new_list;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
