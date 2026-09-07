import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signInSchema, signUpSchema } from "@/lib/schemas";
import { useSession } from "@/hooks/useSession";
import { startDemoSession } from "@/lib/demo-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to DELTA" },
      { name: "description", content: "Sign in or create your DELTA account to track watchlists." },
      { property: "og:title", content: "Sign in to DELTA" },
      {
        property: "og:description",
        content: "Sign in or create your DELTA account to track watchlists.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useSession();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/overview", replace: true });
  }, [user, loading, navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="text-sm font-semibold tracking-[0.35em] text-primary">
          DELTA
        </Link>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Your market memory</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to keep your watchlists and viewing history in sync.
        </p>

        <div className="panel mt-8 p-6">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="pt-6">
              <SignInForm />
            </TabsContent>
            <TabsContent value="signup" className="pt-6">
              <SignUpForm />
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
          <GoogleButton />

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />Demo<span className="h-px flex-1 bg-border" /></div>
          <Button className="w-full" variant="secondary" onClick={() => { startDemoSession(); navigate({ to: "/overview", replace: true }); }}>
            Explore DELTA demo — no account needed
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">Uses the built-in simulated market data. No backend account is required.</p>
        </div>
      </div>
    </main>
  );
}

function GoogleButton() {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="outline"
      className="w-full"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const result = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: window.location.origin,
        });
        if (result.error) {
          setBusy(false);
          toast.error(result.error.message ?? "Google sign-in failed");
          return;
        }
        if (result.redirected) return;
        window.location.assign("/overview");
      }}
    >
      {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
      Continue with Google
    </Button>
  );
}

function SignInForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const parsed = signInSchema.safeParse(values);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0]?.message ?? "Check your details");
          return;
        }
        setBusy(true);
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        setBusy(false);
        if (error) {
          toast.error(error.message);
          return;
        }
        navigate({ to: "/overview", replace: true });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signin-password">Password</Label>
        <Input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
        />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
        Sign in
      </Button>
    </form>
  );
}

function SignUpForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ displayName: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <p className="text-sm text-muted-foreground">
        Check <span className="text-foreground">{values.email}</span> for a confirmation link. Once
        you confirm, you can sign in.
      </p>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const parsed = signUpSchema.safeParse(values);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0]?.message ?? "Check your details");
          return;
        }
        setBusy(true);
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: parsed.data.displayName },
          },
        });
        setBusy(false);
        if (error) {
          toast.error(error.message);
          return;
        }
        if (data.session) {
          navigate({ to: "/overview", replace: true });
          return;
        }
        setSent(true);
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="signup-name">Name</Label>
        <Input
          id="signup-name"
          value={values.displayName}
          onChange={(e) => setValues((v) => ({ ...v, displayName: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
        />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
        Create account
      </Button>
    </form>
  );
}
