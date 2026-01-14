"use client";

import { useEffect, useState } from "react";

type Quote = {
  _id: string;
  createdAt?: number;
  quote: string;
  subject?: string;
  messageId?: string;
};

function formatTime(ms?: number) {
  if (!ms) return "";
  return new Date(ms).toLocaleString();
}

export default function QuotesList() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    const res = await fetch("/api/quotes", { cache: "no-store" });

    if (res.status === 401) {
      // If cookie expires, bounce to login
      window.location.href = "/login?next=/";
      return;
    }

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      setErr(`Fetch failed: ${res.status} ${txt}`);
      return;
    }

    const data = (await res.json()) as { quotes?: Quote[] };
    setQuotes(data.quotes ?? []);
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <section style={{ marginTop: 24, display: "grid", gap: 12 }}>
      {err ? (
        <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Couldn’t load quotes</div>
          <div style={{ opacity: 0.8, fontSize: 14 }}>{err}</div>
        </div>
      ) : quotes.length === 0 ? (
        <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 12 }}>
          No quotes yet.
        </div>
      ) : (
        quotes.map((q) => (
          <article key={q._id} style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 12 }}>
            <div style={{ fontSize: 20, lineHeight: 1.35 }}>{q.quote}</div>

            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", gap: 10, opacity: 0.75 }}>
              <div style={{ fontSize: 13 }}>{q.subject ? <>— {q.subject}</> : <>&nbsp;</>}</div>
              <div style={{ fontSize: 13 }}>{formatTime(q.createdAt)}</div>
            </div>
          </article>
        ))
      )}
    </section>
  );
}
