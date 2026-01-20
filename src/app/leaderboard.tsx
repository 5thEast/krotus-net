"use client";

import { useEffect, useMemo, useState } from "react";

type Entry = {
    _id: string;
    name?: string;
    score?: number | string;
};

function toNum(x: unknown): number {
    if (typeof x === "number") return x;
    if (typeof x === "string") {
        const n = Number(x);
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
}

export default function Leaderboard({
    limit = 50,
    refreshMs = 15000,
}: {
    limit?: number;
    refreshMs?: number;
}) {
    const [rows, setRows] = useState<Entry[]>([]);
    const [err, setErr] = useState<string | null>(null);

    async function load() {
        setErr(null);
        const res = await fetch(`/api/leaderboard?limit=${encodeURIComponent(String(limit))}`, {
            cache: "no-store",
        });

        if (res.status === 401) {
            window.location.href = "/login?next=/";
            return;
        }

        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            setErr(`Failed: ${res.status} ${txt.slice(0, 160)}`);
            return;
        }

        const data = (await res.json()) as { rows?: Entry[] };
        setRows(data.rows ?? []);
    }

    useEffect(() => {
        load();
        const id = window.setInterval(load, refreshMs);
        return () => window.clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [limit, refreshMs]);

    // ✅ robust numeric sort + stable tiebreakers
    const sorted = useMemo(() => {
        const copy = [...rows];

        copy.sort((a, b) => {
            const as = toNum(a.score);
            const bs = toNum(b.score);
            if (bs !== as) return bs - as; // high -> low
            // tiebreaker: name (consistent ordering)
            const an = (a.name ?? "").toLowerCase();
            const bn = (b.name ?? "").toLowerCase();
            if (an < bn) return -1;
            if (an > bn) return 1;
            return 0;
        });

        return copy;
    }, [rows]);

    const top3 = sorted.slice(0, 3);
    const rest = sorted.slice(3, 20);

    return (
        <section
            style={{
                marginTop: 18,
                borderRadius: 0,
                overflow: "hidden",
                color: "#fff",
                border: "2px solid rgba(255, 0, 40, 0.35)",
                background: "rgba(0,0,0,0.78)",
      
                // cheap bevel / inset outline
                boxShadow:
                  "inset 0 0 0 1px rgba(255,255,255,0.06), " +
                  "inset 0 -10px 20px rgba(0,0,0,0.75), " +
                  "0 0 0 1px rgba(0,0,0,0.9)",
            }}
        >

            {/* Header */}
            <div
                style={{
                    padding: "16px 18px",
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "center",
                    gap: 12,
                    borderBottom: "1px solid rgba(255, 0, 40, 0.18)",

                }}
            >
                <div>
                    <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: 0.2 }}>Pong Leaderboard</div>

                </div>

            </div>

            {err ? (
                <div style={{ padding: 18, color: "crimson" }}>{err}</div>
            ) : sorted.length === 0 ? (
                <div style={{ padding: 18, opacity: 0.75 }}>No entries yet.</div>
            ) : (
                <div style={{ padding: 18 }}>
                    {/* Podium */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1.2fr 1fr",
                            gap: 12,
                            alignItems: "end",
                        }}
                    >
                        {[
                            { entryIndex: 1 }, // left = 2nd
                            { entryIndex: 0 }, // center = 1st
                            { entryIndex: 2 }, // right = 3rd
                        ].map(({ entryIndex }) => {
                            const e = top3[entryIndex];
                            if (!e) return <div key={entryIndex} />;

                            const rank = entryIndex + 1; // ✅ correct rank for that entry
                            const height = rank === 1 ? 160 : rank === 2 ? 128 : 108;

                            return (
                                <div
                                    key={e._id}
                                    style={{
                                        borderRadius: 16,
                                        background: "linear-gradient(180deg, #0a0a0a 0%, #000 100%)",
                                        border: "1px solid #222",
                                        padding: 14,
                                        minHeight: height,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                        <div style={{ fontSize: 12, opacity: 0.7 }}>#{rank}</div>
                                        <div style={{ fontSize: 12, opacity: 0.7 }}>wins</div>
                                    </div>

                                    <div style={{ fontSize: rank === 1 ? 28 : 22, fontWeight: 950, letterSpacing: 0.2 }}>
                                        {e.name ?? "unknown"}
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                                        <div style={{ fontSize: 44, fontWeight: 950, lineHeight: 1 }}>
                                            {toNum(e.score)}
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>


                    {/* Standings list (no progress bars) */}
                    <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                        {rest.map((e, i) => (
                            <div
                                key={e._id}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "60px 1fr 90px",
                                    gap: 12,
                                    alignItems: "center",
                                    padding: "12px 12px",
                                    borderRadius: 14,
                                    border: "1px solid #222",
                                    background: "#0f0f0f",
                                }}
                            >
                                <div style={{ fontSize: 12, opacity: 0.7 }}>#{i + 4}</div>
                                <div style={{ fontSize: 16, fontWeight: 850, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {e.name ?? "unknown"}
                                </div>
                                <div style={{ textAlign: "right", fontSize: 18, fontWeight: 950 }}>
                                    {toNum(e.score)}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            )
            }
        </section >
    );
}
