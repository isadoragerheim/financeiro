export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const scriptUrl = process.env.SCRIPT_URL;
    const apiKey = process.env.API_KEY;

    if (!scriptUrl || !apiKey) {
      return new Response(JSON.stringify({ ok: false, error: "SCRIPT_URL/API_KEY não configuradas no Vercel." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();

    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, key: apiKey }),
    });

    const text = await res.text(); // Apps Script retorna JSON como texto
    return new Response(text, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
