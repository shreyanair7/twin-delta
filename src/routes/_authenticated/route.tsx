import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { DemoModeProvider } from "@/lib/market/demo-mode";
import { AppShell } from "@/components/market/AppShell";
import { demoUser, isDemoSession } from "@/lib/demo-auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (isDemoSession()) return { user: demoUser, demo: true };
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user, demo: false };
  },
  component: () => <DemoModeProvider><AppShell><Outlet /></AppShell></DemoModeProvider>,
});
