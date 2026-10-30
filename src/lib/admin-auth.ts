/**
 * Minimal single-admin authentication: a password from ADMIN_PASSWORD and a signed, expiring
 * session cookie (HMAC-SHA256 with ADMIN_SESSION_SECRET). Uses Web Crypto so it runs in both
 * middleware (edge) and server actions (node).
 */
export const SESSION_COOKIE = "arc_admin";
export const SESSION_TTL_S = 60 * 60 * 12; // 12 hours

const enc = new TextEncoder();

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32);
}

async function hmac(data: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(process.env.ADMIN_SESSION_SECRET!), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Constant-time comparison of two strings. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Compares a submitted password with ADMIN_PASSWORD without leaking timing or length. */
export async function checkPassword(input: string) {
  if (!adminConfigured()) return false;
  const [a, b] = await Promise.all([hmac(`pw:${input}`), hmac(`pw:${process.env.ADMIN_PASSWORD}`)]);
  return safeEqual(a, b);
}

export async function createSessionToken() {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_S;
  const payload = `admin.${exp}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function verifySessionToken(token: string | undefined) {
  if (!token || !adminConfigured()) return false;
  const i = token.lastIndexOf(".");
  if (i < 0) return false;
  const payload = token.slice(0, i);
  const [who, exp] = payload.split(".");
  if (who !== "admin" || !(Number(exp) > Date.now() / 1000)) return false;
  return safeEqual(token.slice(i + 1), await hmac(payload));
}
