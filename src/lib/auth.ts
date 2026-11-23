/**
 * Demo login: a cookie holding `payload.signature`, where the payload is the
 * user and an expiry, and the signature is HMAC-SHA256 with AUTH_SECRET.
 * Uses only Web Crypto so it runs in the proxy and in server actions.
 *
 * Do not modify without a human reviewer (see AGENTS.md).
 */

export const SESSION_COOKIE = "crm_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = { user: string; exp: number };

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> | null {
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(
  user: string,
  secret: string,
  now: Date = new Date(),
): Promise<string> {
  const payload: SessionPayload = {
    user,
    exp: Math.floor(now.getTime() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const encoded = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign(
    "HMAC",
    await importKey(secret),
    encoder.encode(encoded),
  );
  return `${encoded}.${toBase64Url(new Uint8Array(signature))}`;
}

/** Returns the user if the token is well signed and not expired. */
export async function verifySessionToken(
  token: string | undefined,
  secret: string,
  now: Date = new Date(),
): Promise<string | null> {
  if (!token) return null;
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra !== undefined) return null;
  const signatureBytes = fromBase64Url(signature);
  if (!signatureBytes) return null;

  // subtle.verify compares in constant time.
  const valid = await crypto.subtle.verify(
    "HMAC",
    await importKey(secret),
    signatureBytes,
    encoder.encode(encoded),
  );
  if (!valid) return null;

  const payloadBytes = fromBase64Url(encoded);
  if (!payloadBytes) return null;
  try {
    const payload = JSON.parse(
      new TextDecoder().decode(payloadBytes),
    ) as Partial<SessionPayload>;
    if (typeof payload.user !== "string" || typeof payload.exp !== "number") {
      return null;
    }
    return payload.exp > now.getTime() / 1000 ? payload.user : null;
  } catch {
    return null;
  }
}

/** Compares two strings without leaking where they differ. */
export async function safeEqual(
  a: string,
  b: string,
  secret: string,
): Promise<boolean> {
  const key = await importKey(secret);
  const [ha, hb] = await Promise.all([
    crypto.subtle.sign("HMAC", key, encoder.encode(a)),
    crypto.subtle.sign("HMAC", key, encoder.encode(b)),
  ]);
  const va = new Uint8Array(ha);
  const vb = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < va.length; i++) diff |= (va[i] ?? 0) ^ (vb[i] ?? 0);
  return diff === 0;
}

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return secret;
}
