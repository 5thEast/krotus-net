import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import QuotesList from "./quotes-list";

export const dynamic = "force-dynamic";

export default async function Page() {
  const cookieStore = await cookies();
  const authed = cookieStore.get("krotus_auth")?.value === "1";
  if (!authed) redirect("/login?next=/");

  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: "0 16px", fontFamily: "ui-sans-serif, system-ui" }}>
      <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ fontSize: 36, margin: 0 }}>krotus.net</h1>
        <div style={{ opacity: 0.7, fontSize: 14 }}>Updating every ~10s</div>
      </header>

      <QuotesList />

      <footer style={{ marginTop: 28, opacity: 0.6, fontSize: 12 }}>
        Data served via <code>/api/quotes</code>.
      </footer>
    </main>
  );
}
