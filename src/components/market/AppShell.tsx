import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronLeft, ChevronRight, LayoutDashboard, List, PlayCircle, Lightbulb, Search, Settings, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { endDemoSession, isDemoSession } from "@/lib/demo-auth";

const nav = [
  { to: "/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/watchlists", label: "Watchlists", icon: List },
  { to: "/replay", label: "Replay", icon: PlayCircle },
  { to: "/insights", label: "Insights", icon: Lightbulb },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSession();
  const name = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  async function logout() { if (isDemoSession()) endDemoSession(); else await supabase.auth.signOut(); navigate({ to: "/auth", replace: true }); }

  return <div className="min-h-screen bg-background text-foreground">
    <aside className={`fixed inset-y-0 left-0 z-30 hidden border-r border-border/70 bg-sidebar/80 backdrop-blur-xl transition-all duration-300 md:flex md:flex-col ${collapsed ? "w-20" : "w-64"}`}>
      <div className="flex h-20 items-center px-5"> <Link to="/overview" className="flex items-center gap-3 overflow-hidden"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary font-bold text-primary-foreground">Δ</span>{!collapsed && <span className="text-sm font-semibold tracking-[.28em] text-primary">DELTA</span>}</Link></div>
      <nav className="flex-1 space-y-1 px-3">{nav.map(({to,label,icon:Icon}) => <Link key={to} to={to} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${location.pathname===to ? "bg-primary/12 text-primary" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"}`}><Icon className="size-5 shrink-0" />{!collapsed && label}</Link>)}</nav>
      <div className="space-y-1 border-t border-border/60 p-3">
        <Link to="/settings" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground hover:bg-secondary/70 hover:text-foreground"><Settings className="size-5" />{!collapsed && "Settings"}</Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground hover:bg-secondary/70 hover:text-foreground"><LogOut className="size-5" />{!collapsed && "Logout"}</button>
        <button onClick={()=>setCollapsed(v=>!v)} className="absolute -right-3 top-24 grid size-6 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground">{collapsed?<ChevronRight className="size-3"/>:<ChevronLeft className="size-3"/>}</button>
      </div>
    </aside>
    <div className={`transition-all duration-300 ${collapsed ? "md:ml-20" : "md:ml-64"}`}>
      <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl md:px-8">
        <div className="relative hidden max-w-md flex-1 md:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input placeholder="Search stocks..." className="h-10 border-border/70 bg-secondary/40 pl-9"/></div>
        <div className="ml-auto flex items-center gap-3">{isDemoSession() && <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-primary">DEMO MODE</span>}<span className="hidden text-xs text-muted-foreground lg:block">Welcome back, <span className="text-foreground">{name}</span></span><Button size="icon" variant="ghost" className="rounded-full"><Bell className="size-5"/></Button><div className="grid size-9 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">{name.slice(0,1).toUpperCase()}</div></div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-7 pb-24 md:px-8">{children}</main>
    </div>
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-border bg-background/95 px-2 py-2 backdrop-blur md:hidden">{nav.map(({to,label,icon:Icon})=><Link key={to} to={to} className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-[10px] ${location.pathname===to?"text-primary":"text-muted-foreground"}`}><Icon className="size-5"/>{label}</Link>)}</nav>
  </div>;
}
