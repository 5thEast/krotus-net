"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Quote = {
  _id: string;
  createdAt?: number;
  quote: string;
  subject?: string;
};

type Phase = "in" | "out";

export default function QuoteBanner({
  intervalMs = 6000,
  refreshMs = 30000,
}: {
  intervalMs?: number; // how often to switch to the next quote
  refreshMs?: number;  // how often to refetch latest quotes
}) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("in");
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

    function scheduleNext() {
      // slide out near the end, then advance, then slide in
      switchTimer.current = window.setTimeout(() => {
        setPhase("out");
        window.setTimeout(() => {
          setIdx((x) => x + 1);
          setPhase("in");
          scheduleNext();
        }, 420); // must match CSS transition duration
      }, intervalMs);
    }

    scheduleNext();

    return () => {
      if (switchTimer.current) window.clearTimeout(switchTimer.current);
    };
  }, [quotes.length, intervalMs]);

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: "10px 12px",
        overflow: "hidden",
        background: "black",
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
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  lineHeight: 1.35,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  transform:
                    phase === "in" ? "translateX(0%)" : "translateX(-110%)",
                  opacity: phase === "in" ? 1 : 0,
                  transition: "transform 420ms ease, opacity 420ms ease",
                }}
                title={current.quote}
              >
                {current.quote}
              </div>

              <div
                style={{
                  fontSize: 12,
                  opacity: 0.7,
                  whiteSpace: "nowrap",
                  marginLeft: 12,
                }}
              >
                {current.subject ? `— ${current.subject}` : ""}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            setPhase("out");
            window.setTimeout(() => {
              setIdx((x) => x + 1);
              setPhase("in");
            }, 200);
          }}
          style={{
            padding: "6px 10px",
            borderRadius: 10,
            border: "1px solid #333",
            background: "#111",
            color: "#fff",
            cursor: "pointer",
            fontSize: 12,
            opacity: 0.9,
          }}
          title="Next quote"
        >
          next →
        </button>

      </div>
    </div>
  );
}
