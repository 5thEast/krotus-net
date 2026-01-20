"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Quote = {
  _id: string;
  createdAt?: number;
  quote: string;
  subject?: string;
};

type Phase = "enter" | "center" | "exit";



function cleanQuote(text: string) {
  return (text ?? "").trim().replace(/\s+/g, " ");
}

function withQuotes(text: string) {
  const t = cleanQuote(text);

  // if it already starts/ends with quotes, don't double-wrap
  const alreadyQuoted =
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("“") && t.endsWith("”")) ||
    (t.startsWith("'") && t.endsWith("'"));

  return alreadyQuoted ? t : `“${t}”`;
}

function lowerSender(s?: string) {
  return (s ?? "").trim().toLowerCase();
}


export default function QuoteBanner({
  intervalMs = 6000,
  refreshMs = 30000,
}: {
  intervalMs?: number; // how often to switch to the next quote
  refreshMs?: number;  // how often to refetch latest quotes
}) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("enter");
  const [err, setErr] = useState<string | null>(null);

  const switchTimer = useRef<number | null>(null);
  const refreshTimer = useRef<number | null>(null);

  const current = useMemo(() => {
    if (quotes.length === 0) return null;
    return quotes[idx % quotes.length];
  }, [quotes, idx]);

  async function load() {
    setErr(null);
    const res = await fetch("/api/quotes?limit=50", { cache: "no-store" });

    if (res.status === 401) {
      window.location.href = "/login?next=/";
      return;
    }

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      setErr(`Failed to load quotes: ${res.status} ${txt.slice(0, 120)}`);
      return;
    }

    const data = (await res.json()) as { quotes?: Quote[] };
    const q = data.quotes ?? [];
    setQuotes(q);
    if (q.length > 0) setIdx((prev) => prev % q.length);
  }

  // Initial load + periodic refresh
  useEffect(() => {
    load();
    refreshTimer.current = window.setInterval(load, refreshMs);
    return () => {
      if (refreshTimer.current) window.clearInterval(refreshTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rotate quotes with a simple in/out animation
  useEffect(() => {
    if (quotes.length === 0) return;

    let cancelled = false;

    function cycle() {
      if (cancelled) return;

      // start offscreen right
      setPhase("enter");

      // move into center
      setTimeout(() => {
        if (cancelled) return;
        setPhase("center");
      }, 20);

      // after interval, exit left
      setTimeout(() => {
        if (cancelled) return;
        setPhase("exit");
      }, intervalMs - 450);

      // after exit animation, advance quote
      setTimeout(() => {
        if (cancelled) return;
        setIdx((x) => x + 1);
        cycle();
      }, intervalMs);
    }

    cycle();

    return () => {
      cancelled = true;
    };
  }, [quotes.length, intervalMs]);

  return (
    <div
      style={{
        padding: "10px 12px",
        overflow: "hidden",
        background: "#000000",
        color: "#ffffff",
        border: "1px solid #222",
        borderRadius: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {err ? (
            <div style={{ fontSize: 14, color: "crimson" }}>{err}</div>
          ) : !current ? (
            <div style={{ fontSize: 14, opacity: 0.7 }}>Loading…</div>
          ) : (
            <div
              style={{
                fontSize: 15,
                lineHeight: 1.35,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                transform:
                  phase === "enter"
                    ? "translateX(110%)"
                    : phase === "center"
                      ? "translateX(0%)"
                      : "translateX(-110%)",
                opacity: phase === "center" ? 1 : 0,

                transition: "transform 420ms ease, opacity 420ms ease",
              }}
              title={`${current.quote}${current.subject ? ` — ${current.subject}` : ""}`}
            >
              <span>{withQuotes(current.quote)}</span>

              {current.subject ? (
                <span style={{ opacity: 0.75, marginLeft: 10 }}>
                  — {lowerSender(current.subject)}
                </span>
              ) : null}

            </div>
          )}
        </div>
      </div>
    </div>
  );

}
