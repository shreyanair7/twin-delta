import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { demoUser, isDemoSession } from "@/lib/demo-auth";

/** Tracks the persisted auth session in the browser. */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (isDemoSession()) {
      setSession({ user: demoUser } as unknown as Session);
      setLoading(false);
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active || isDemoSession()) return;
      setSession(next);
      setLoading(false);
    });

    if (!isDemoSession()) {
      supabase.auth.getSession().then(({ data }) => {
        if (!active || isDemoSession()) return;
        setSession(data.session);
        setLoading(false);
      });
    }

    const onDemoAuth = () => {
      if (!active) return;
      setSession(isDemoSession() ? ({ user: demoUser } as unknown as Session) : null);
      setLoading(false);
    };
    window.addEventListener("delta-demo-auth", onDemoAuth);

    return () => {
      active = false;
      sub.subscription.unsubscribe();
      window.removeEventListener("delta-demo-auth", onDemoAuth);
    };
  }, []);

  return { session, user: session?.user ?? null, loading };
}
