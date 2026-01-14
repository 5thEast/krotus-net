"use client";
export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginInner() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error || "Login failed");
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <main style={{ maxWidth: 520, margin: "90px auto", padding: "0 16px", fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 30, marginBottom: 8 }}>krotus.net</h1>
      <p style={{ opacity: 0.7, marginTop: 0 }}>Enter the site password.</p>

      <form onSubmit={onSubmit} style={{ marginTop: 18, display: "grid", gap: 10 }}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{ padding: 12, borderRadius: 10, border: "1px solid #e5e7eb" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: 12, borderRadius: 10, border: "1px solid #e5e7eb", cursor: "pointer" }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, fontFamily: "ui-sans-serif, system-ui" }}>Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}
