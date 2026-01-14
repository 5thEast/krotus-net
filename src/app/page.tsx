import { headers } from "next/headers";

export const revalidate = 10;

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

async function getLatestQuotes(): Promise<Quote[]> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) throw new Error("Missing host header");

  const origin = `${proto}://${host}`;

  const res = await fetch(`${origin}/api/quotes`, {
    next: { revalidate: 10 },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Fetch failed: ${res.status} ${res.statusText} ${txt}`);
  }

  const data = (await res.json()) as { quotes?: Quote[] };
  return data.quotes ?? [];
}

export default async function Page() {
  let quotes: Quote[] = [];
  let error: string | null = null;

  try {
    quotes = await getLatestQuotes();
  } catch (e: any) {
    error = e?.message ?? "Failed to load quotes";
  }

  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: "0 16px", fontFamily: "ui-sans-serif, system-ui" }}>
      <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ fontSize: 36, margin: 0 }}>krotus.net</h1>
        <div style={{ opacity: 0.7, fontSize: 14 }}>Updating every ~10s</div>
      </header>

      <section style={{ marginTop: 24, display: "grid", gap: 12 }}>
        {error ? (
          <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Couldn’t load quotes</div>
            <div style={{ opacity: 0.8, fontSize: 14 }}>{error}</div>
          </div>
        ) : quotes.length === 0 ? (
          <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 12 }}>No quotes yet.</div>
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

      <footer style={{ marginTop: 28, opacity: 0.6, fontSize: 12 }}>
        Data served via <code>/api/quotes</code> (secret stays server-side).
      </footer>
    </main>
  );
}
