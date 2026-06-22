import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { checkRateLimit } from "@/lib/rate-limit";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    // yine de sabit-zaman çalıştır, sonra false dön
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

// Tek workspace, iki sabit hesap (sen + ortağın). Yeni kayıt YOK.
// Şifre sunucuda doğrulanır, httpOnly cookie ile oturum açılır.

const ACCOUNTS: Record<string, string> = {
  "m1": "Sen",
  "m2": "Ortağım",
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  // brute-force koruması: dakikada 8 deneme
  if (!checkRateLimit(`auth:${ip}`, 8, 60_000)) {
    return NextResponse.json({ error: "Çok fazla deneme. Bir dakika bekle." }, { status: 429 });
  }

  let body: { account?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const account = String(body.account ?? "");
  const password = String(body.password ?? "");
  const expected = process.env.WORKSPACE_PASSWORD;

  if (!expected) {
    return NextResponse.json({ error: "Sunucu yapılandırılmamış." }, { status: 500 });
  }
  if (!ACCOUNTS[account]) {
    return NextResponse.json({ error: "Geçersiz hesap." }, { status: 401 });
  }
  if (!safeEqual(password, expected)) {
    return NextResponse.json({ error: "Şifre hatalı." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, account });
  res.cookies.set("fos_session", account, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 gün
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("fos_session");
  return res;
}
