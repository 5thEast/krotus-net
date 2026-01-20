"use client";

import { useEffect, useMemo, useState } from "react";

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

export default function SaturnaliaCountdown() {
    // Jan 31, 2026 10:00 PM Eastern (EST, UTC-5) = Feb 1, 2026 03:00:00 UTC
    const target = useMemo(() => new Date(Date.UTC(2026, 1, 1, 3, 0, 0)), []);

    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const diffMs = target.getTime() - now.getTime();

    const pillStyle: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 999,
        border: "1px solid rgba(255, 0, 40, 0.25)",
        background: "linear-gradient(180deg, rgba(30,0,0,0.7) 0%, rgba(0,0,0,0.92) 100%)",
        color: "#f4f4f5",
        fontSize: 12,
        letterSpacing: 0.9,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        boxShadow: "0 0 30px rgba(255,0,30,0.12)",
    };


    if (diffMs <= 0) {
        return (
            <div style={pillStyle} title="Saturnalia — Jan 31, 2026 10:00 PM ET">
                <span style={{ opacity: 0.75 }}>Saturnalia countdown:</span>
                <span style={{ fontWeight: 950, letterSpacing: 0.2, textTransform: "none" }}>
                    0d {pad2(0)}:{pad2(0)}:{pad2(0)}
                </span>
            </div>
        );
    }

    const totalSec = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    return (
        <div style={pillStyle} title="Saturnalia — Jan 31, 2026 10:00 PM ET">
            <span style={{ opacity: 0.75 }}>Saturnalia countdown:</span>
            <span style={{ fontWeight: 950, letterSpacing: 0.2, textTransform: "none", color: "#ffe7e9" }}>
                {days}d {pad2(hours)}h {pad2(mins)}m {pad2(secs)}s
            </span>


        </div>
    );
}
