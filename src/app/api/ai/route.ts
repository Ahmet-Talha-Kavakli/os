import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

// Claude (Anthropic Messages API)
const MODEL = "claude-opus-4-8";
const ENDPOINT = "https://api.anthropic.com/v1/messages";

const SYSTEM = `Sen "Founder OS" adlı bir şirket-yönetim uygulamasının içindeki AI asistanısın.
Kullanıcı tek/iki kişilik bir founder ekibi ve 20+ MVP projesini şirketleşmeye taşıyor.
Türkçe, net, eyleme dönük cevap ver. Gereksiz girişler yapma.
İstendiğinde: görevi alt görevlere böl, haftalık özet çıkar, launch checklist üret, metin yaz/özetle, öncelik sırala.
Markdown kullanabilirsin (başlık, liste, kalın). Madde listelerini tercih et.`;

const MAX_PROMPT = 8000;
const MAX_CONTEXT = 20000;

export async function POST(req: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "AI yapılandırılmamış." }, { status: 500 });
  }

  // basit rate limit (IP başına)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!checkRateLimit(`ai:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "Çok fazla istek. Biraz bekle." }, { status: 429 });
  }

  let body: { prompt?: string; context?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const prompt = (body.prompt ?? "").toString().slice(0, MAX_PROMPT).trim();
  const context = (body.context ?? "").toString().slice(0, MAX_CONTEXT);
  if (!prompt) return NextResponse.json({ error: "Boş istek." }, { status: 400 });

  const userText = context ? `Workspace bağlamı:\n${context}\n\n---\nİstek: ${prompt}` : prompt;

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system: SYSTEM,
        messages: [{ role: "user", content: userText }],
      }),
    });

    if (!res.ok) {
      // hata detayını kullanıcıya sızdırma — sadece logla
      const errText = await res.text();
      console.error("Anthropic error:", res.status, errText.slice(0, 300));
      return NextResponse.json({ error: "AI şu an yanıt veremedi." }, { status: 502 });
    }

    const data = await res.json();
    const text =
      data?.content?.filter((b: any) => b.type === "text").map((b: any) => b.text).join("") ??
      "Yanıt üretilemedi.";

    return NextResponse.json({ text });
  } catch (e: any) {
    console.error("AI route error:", String(e).slice(0, 200));
    return NextResponse.json({ error: "Bağlantı hatası." }, { status: 500 });
  }
}
