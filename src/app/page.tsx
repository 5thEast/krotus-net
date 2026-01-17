import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import QuoteBanner from "./quote-banner";

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
        padding: "0 16px",
        fontFamily: "ui-sans-serif, system-ui",
      }}
    >
      <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ fontSize: 32, margin: 0 }}>krotus.net</h1>
        <div style={{ opacity: 0.7, fontSize: 14 }}>private</div>
      </header>

      {/* Small rotating quote banner */}
      <div style={{ marginTop: 16 }}>
        <QuoteBanner intervalMs={6000} />
      </div>

      {/* Main content area (leaderboard goes here later) */}
      <section style={{ marginTop: 28 }}>
        <div
          style={{
            padding: 18,
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            opacity: 0.75,
          }}
        >
          Leaderboard coming soon...
        </div>
      </section>

      <footer style={{ marginTop: 28, opacity: 0.6, fontSize: 12 }}>
        Quotes load from <code>/api/quotes</code>.
      </footer>
    </main>
  );
}
