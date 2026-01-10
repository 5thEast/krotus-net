export const revalidate = 10; // refresh server-rendered data every 10s (ISR)

type Quote = {
  _id: string;
  createdAt?: number; // ms since epoch
  quote: string;
  subject?: string;
  messageId?: string;
};

async function getLatestQuotes(): Promise<Quote[]> {
  const url = process.env.NEXT_PUBLIC_QUOTES_URL;
  if (!url) throw new Error("Missing NEXT_PUBLIC_QUOTES_URL");

  const res = await fetch(url, {
    // with revalidate above, Next will cache + refresh automatically
    next: { revalidate: 10 },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Fetch failed: ${res.status} ${res.statusText} ${txt}`);
  }

  const data = (await res.json()) as { quotes?: Quote[] };
  return data.quotes ?? [];
}

function formatTime(ms?: number) {
  if (!ms) return "";
  const d = new Date(ms);
  return d.toLocaleString();
}

export default async function Page() {
  const quotes = await getLatestQuotes();

  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: "0 16px", fontFamily: "ui-sans-serif, system-ui" }}>
      <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ fontSize: 36, margin: 0 }}>krotus.net</h1>
        <div style={{ opacity: 0.7, fontSize: 14 }}>
          Updating every ~10s
        </div>
      </header>

      <section style={{ marginTop: 24, display: "grid", gap: 12 }}>
        {quotes.length === 0 ? (
          <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 12 }}>
            No quotes yet.
          </div>
        ) : (
          quotes.map((q) => (
            <article key={q._id} style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 12 }}>
              <div style={{ fontSize: 20, lineHeight: 1.35 }}>{q.quote}</div>

              <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", gap: 10, opacity: 0.75 }}>
                <div style={{ fontSize: 13 }}>
                  {q.subject ? <>— {q.subject}</> : <>&nbsp;</>}
                </div>
                <div style={{ fontSize: 13 }}>
                  {formatTime(q.createdAt)}
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      <footer style={{ marginTop: 28, opacity: 0.6, fontSize: 12 }}>
        Data from your Convex HTTP endpoint.
      </footer>
    </main>
  );
}
