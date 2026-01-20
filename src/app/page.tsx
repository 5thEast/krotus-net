import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import QuoteBanner from "./quote-banner";
import Leaderboard from "./leaderboard";
export const dynamic = "force-dynamic";
import SaturnaliaCountdown from "./countdown";


export default async function Page() {
  const cookieStore = await cookies();
  const authed = cookieStore.get("krotus_auth")?.value === "1";
  if (!authed) redirect("/login?next=/");

  return (
    <main
      style={{
        maxWidth: 980,
        margin: "40px auto",
        padding: "0 16px",
        fontFamily: "ui-sans-serif, system-ui",
      }}
    >
      <header style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <h1 style={{ fontSize: 32, margin: 0, fontWeight: 600 }}>KROTUS.NET</h1> 
        <SaturnaliaCountdown />
      </header>

      {/* Small rotating quote banner */}
      <div style={{ marginTop: 16 }}>
        <QuoteBanner intervalMs={6000} />
      </div>


      <Leaderboard />

    </main>
  );
}
