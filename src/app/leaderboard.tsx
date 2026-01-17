"use client";

import { useEffect, useState } from "react";

type Entry = {
  _id: string;
  name?: string;
  score?: number;
};

export default function Leaderboard() {
  const [rows, setRows] = useState<Entry[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    const res = await fetch("/api/leaderboard?limit=20", { cache: "no-store" });

    if (res.status === 401) {
      window.location.href = "/login?next=/";
      return;
    }

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      setErr(`Failed: ${res.status} ${txt.slice(0, 120)}`);
      return;
    }

    const data = (await res.json()) as { rows?: Entry[] };
    setRows(data.rows ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ marginTop: 18, border: "1px solid #222", borderRadius: 14, padding: 16, background: "#000", color: "#fff" }}>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Leaderboard</div>

      {err ? (
        <div style={{ color: "crimson" }}>{err}</div>
      ) : rows.length === 0 ? (
        <div style={{ opacity: 0.7 }}>No entries yet.</div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {rows.map((r, i) => (
            <div
              key={r._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                border: "1px solid #222",
                borderRadius: 12,
                padding: "10px 12px",
                background: "#0b0b0b",
              }}
            >
              <div style={{ opacity: 0.9 }}>
                <span style={{ opacity: 0.6, marginRight: 10 }}>#{i + 1}</span>
                {r.name ?? "unknown"}
              </div>
              <div style={{ fontWeight: 700 }}>{r.score ?? 0}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
