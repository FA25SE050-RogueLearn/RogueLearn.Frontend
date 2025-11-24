import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { refresh_token } = await req.json();
    const client_id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const client_secret = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;
    if (!refresh_token || !client_id || !client_secret) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }
    const body = new URLSearchParams({
      client_id,
      client_secret,
      refresh_token,
      grant_type: "refresh_token",
    });
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
      scope: data.scope,
    });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}