import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import QuoteBanner from "./quote-banner";
import Leaderboard from "./leaderboard";
import SaturnaliaCountdown from "./countdown";

export const dynamic = "force-dynamic";

export default async function Page() {
  const cookieStore = await cookies();
  const authed = cookieStore.get("krotus_auth")?.value === "1";
  if (!authed) redirect("/login?next=/");

  return (
    <main
      style={{
        maxWidth: 980,
        margin: "40px auto",
        padding: "0 16px 80px",
        fontFamily: "ui-sans-serif, system-ui",
        color: "#f4f4f5",
      }}
    >
      {/* BASE BACKGROUND (flat, not gradient) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -30,
          background: "#050506",
        }}
      />

      {/* CHECKERBOARD BACKGROUND */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -21, // ✅ visible: above base, below blood (-20)
          pointerEvents: "none",
          backgroundImage: `
      linear-gradient(45deg, rgba(255,255,255,0.10) 25%, transparent 25%),
      linear-gradient(-45deg, rgba(255,255,255,0.10) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.10) 75%),
      linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.10) 75%)
    `,
          backgroundSize: "60px 60px",
          backgroundPosition: "0 0, 0 30px, 30px -30px, -30px 0px",
          opacity: 0.35,
          filter: "contrast(125%) brightness(80%)",
        }}
      />


      {/* BLOOD DRIP PNG OVERLAY (put file at /public/blood.png) */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: 230, // how tall the blood strip is
          zIndex: -20,
          pointerEvents: "none",

          backgroundImage: "url(/blood.png)",
          backgroundRepeat: "repeat-x",
          backgroundPosition: "top center",
          backgroundSize: "auto 230px", // scale height, repeat width
          filter: "brightness(0.85) contrast(1.15) saturate(1.2)",
          opacity: 1,
        }}
      />

      {/* GRUNGE TEXTURE (subtle speckle/scratch overlay) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -10,
          pointerEvents: "none",
          opacity: 0.22,
          backgroundImage: `
            radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1.6px),
            repeating-linear-gradient(
              0deg,
              rgba(255,255,255,0.02) 0px,
              rgba(255,255,255,0.02) 1px,
              transparent 1px,
              transparent 7px
            )
          `,
          backgroundSize: "14px 14px, 100% 100%",
          mixBlendMode: "overlay",
          filter: "contrast(140%) brightness(80%)",
        }}
      />

      {/* HEADER */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 10,
          marginTop: 14,
          padding: "16px 14px",
          borderRadius: 16,
          border: "1px solid rgba(255, 0, 40, 0.22)",
          background: "rgba(0,0,0,0.55)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.85), 0 18px 60px rgba(0,0,0,0.7)",
        }}
      >
        <h1
          style={{
            fontSize: 34,
            margin: 0,
            fontWeight: 800,
            letterSpacing: 2.4,
            textTransform: "uppercase",
            textShadow: "0 0 18px rgba(255,0,30,0.12)",
          }}
        >
          KROTUS.NET
        </h1>

        <SaturnaliaCountdown />
      </header>

      {/* QUOTE BANNER */}
      <div style={{ marginTop: 16 }}>
        <QuoteBanner intervalMs={6000} />
      </div>

      {/* LEADERBOARD */}
      <div style={{ marginTop: 18 }}>
        <Leaderboard />
      </div>
    </main >
  );
}
