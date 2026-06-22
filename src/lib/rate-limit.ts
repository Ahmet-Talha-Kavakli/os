// Basit in-memory rate limiter (tek sunucu için yeterli).
// Üretimde çoklu instance varsa Upstash/Redis'e taşınmalı.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function checkRateLimit(keyId: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(keyId);
  if (!b || now > b.resetAt) {
    buckets.set(keyId, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}

// periyodik temizlik (bellek sızıntısını önle)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
  }, 5 * 60_000).unref?.();
}
