import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const rawBase = process.env.USER_API_BASE || process.env.NEXT_PUBLIC_USER_API_URL || "http://localhost:5051";
    let base = (rawBase || "").replace(/\/+$/, "");
    if (base.endsWith("/api")) base = base.slice(0, -4);
    const url = `${base}/api/quests/game/sessions/create`;
    const insecure = process.env.INSECURE_TLS === "1";
    if (insecure && url.startsWith("https://")) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, { status: res.status });
    } catch {
      return NextResponse.json({ ok: false, error: text || `Upstream error ${res.status}`, url, base, insecure }, { status: res.status });
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err), base: process.env.USER_API_BASE || process.env.NEXT_PUBLIC_USER_API_URL, insecure: process.env.INSECURE_TLS === "1" }, { status: 502 });
  }
}
