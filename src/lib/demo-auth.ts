export const DEMO_AUTH_KEY = "delta-demo-session";

export const demoUser = {
  id: "delta-demo-user",
  email: "demo@delta.app",
  user_metadata: { full_name: "Demo Investor", display_name: "Demo Investor" },
} as const;

export function isDemoSession() {
  return typeof window !== "undefined" && window.localStorage.getItem(DEMO_AUTH_KEY) === "true";
}

export function startDemoSession() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(DEMO_AUTH_KEY, "true");
    window.dispatchEvent(new Event("delta-demo-auth"));
  }
}

export function endDemoSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(DEMO_AUTH_KEY);
    window.dispatchEvent(new Event("delta-demo-auth"));
  }
}
