"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Quote = {
  _id: string;
  createdAt?: number;
  quote: string;
  subject?: string;
};

function cleanQuote(text: string) {
  return (text ?? "").trim().replace(/\s+/g, " ");
}

function withQuotes(text: string) {
  const t = cleanQuote(text);
  const alreadyQuoted =
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("“") && t.endsWith("”")) ||
    (t.startsWith("'") && t.endsWith("'"));
  return alreadyQuoted ? t : `“${t}”`;
}

function lowerSender(s?: string) {
  return (s ?? "").trim().toLowerCase();
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


export default function QuoteBanner({
  refreshMs = 30000,
  gapPx = 48,
  pxPerSecond = 40, // speed control
}: {
  refreshMs?: number;
  gapPx?: number;       // spacing between quotes
  pxPerSecond?: number; // ticker speed
}) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // measured width of ONE copy of the quotes row
  const [halfWidth, setHalfWidth] = useState(0);
  const [durationSec, setDurationSec] = useState(20);

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
    setQuotes(shuffle(q));
  }

  useEffect(() => {
    load();
    const t = window.setInterval(load, refreshMs);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Measure widths after render (and on resize)
  useEffect(() => {
    function measure() {
      const track = trackRef.current;
      if (!track) return;

      // track contains 2 copies; half is one copy
      const full = track.scrollWidth;
      const half = Math.floor(full / 2);
      setHalfWidth(half);

      // duration based on distance / speed
      const sec = Math.max(8, half / pxPerSecond);
      setDurationSec(sec);
    }

    // measure soon after paint
    const r1 = requestAnimationFrame(() => measure());
    const r2 = requestAnimationFrame(() => measure());

    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      window.removeEventListener("resize", measure);
    };
  }, [quotes, pxPerSecond, gapPx]);

  const doubled = useMemo(() => {
    // duplicate for seamless looping
    return quotes.length ? [...quotes, ...quotes] : [];
  }, [quotes]);

  return (
    <div
      ref={wrapRef}
      style={{
        padding: "12px 14px",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      {err ? (
        <div style={{ fontSize: 14, color: "crimson" }}>{err}</div>
      ) : quotes.length === 0 ? (
        <div style={{ fontSize: 14, opacity: 0.7 }}>Loading…</div>
      ) : (
        <>
          {/* local keyframes */}
          <style>{`
            @keyframes quoteTicker {
              from { transform: translateX(0); }
              to   { transform: translateX(-${halfWidth}px); }
            }
          `}</style>

          <div
            ref={trackRef}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: `${gapPx}px`,
              willChange: "transform",
              animation: `quoteTicker ${durationSec}s linear infinite`,
            }}
          >
            {doubled.map((q, i) => (
              <span
                key={`${q._id}-${i}`}
                style={{
                  display: "inline-flex",
                  alignItems: "baseline",
                  fontSize: 15,
                  lineHeight: 1.35,
                  // optional: prevent each quote chunk from shrinking
                  flex: "0 0 auto",
                }}
                title={`${q.quote}${q.subject ? ` — ${q.subject}` : ""}`}
              >
                <span>{withQuotes(q.quote)}</span>
                {q.subject ? (
                  <span style={{ opacity: 0.9, marginLeft: 10, color: "#ff2a3b" }}>
                    — {lowerSender(q.subject)}
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
