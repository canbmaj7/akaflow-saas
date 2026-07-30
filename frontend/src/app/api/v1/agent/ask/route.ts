import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

function backendUrl() {
  const url =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:8000";
  return url.replace(/\/$/, "");
}

export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth) {
    return NextResponse.json({ detail: "Kimlik doğrulama gerekli" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Geçersiz istek gövdesi" }, { status: 400 });
  }

  try {
    const response = await fetch(`${backendUrl()}/api/v1/agent/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120_000),
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bağlantı hatası";
    return NextResponse.json(
      { detail: `AI asistan yanıt veremedi (${message}). Backend çalışıyor mu?` },
      { status: 504 },
    );
  }
}
