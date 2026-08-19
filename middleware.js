/**
 * Konverge AI — demo link guard
 * =============================
 *
 * Vercel Routing Middleware. Runs on Vercel's edge before anything is served,
 * so it works for this Vite app even though there is no server framework here.
 *
 * Vercel finds this file because it is named middleware.js and sits beside
 * package.json. Do not move or rename it.
 *
 * What it does
 *   A visitor arriving with a valid ?kv= token from the Solution Explorer gets
 *   a short-lived cookie, and the token is stripped from the address bar. Anyone
 *   arriving without one is redirected back to the Explorer.
 *
 *   So the demo URL can still be copied — it just stops working elsewhere. The
 *   token lasts one hour from the moment the Explorer issued it.
 *
 * What it cannot do
 *   Stop screenshots or screen recording. Nothing can.
 *
 * Two environment variables on this project's Vercel settings:
 *   DEMO_LINK_SECRET   exactly the same value as on the hub
 *   HUB_URL            e.g. https://kaishowroom.vercel.app
 */

const COOKIE = "kv_demo";
const PARAM = "kv";

function fromBase64Url(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function toBase64Url(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Compares without leaking where two strings diverge. */
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return difference === 0;
}

async function verify(token, secret) {
  const [body, signature] = String(token).split(".");
  if (!body || !signature) return null;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const expected = toBase64Url(
      new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)))
    );

    if (!safeEqual(signature, expected)) return null;

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body)));
    if (!payload.x || payload.x * 1000 < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

function readCookie(request, name) {
  const header = request.headers.get("cookie");
  if (!header) return null;

  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

function sendToHub() {
  const hub = process.env.HUB_URL;

  if (!hub) {
    return new Response("This demo requires access. Please contact Konverge AI.", {
      status: 403,
      headers: { "Content-Type": "text/plain" }
    });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: hub,
      "Set-Cookie": `${COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`,
      "Cache-Control": "no-store"
    }
  });
}

export default async function middleware(request) {
  const secret = process.env.DEMO_LINK_SECRET;

  // Not configured yet — stay open rather than locking everyone out by accident.
  if (!secret) return;

  const url = new URL(request.url);
  const token = url.searchParams.get(PARAM);

  if (token) {
    const payload = await verify(token, secret);
    if (!payload) return sendToHub();

    // Strip the token from the address bar, so what the visitor can copy is the
    // bare URL, and hold the grant in a cookie for the rest of its life.
    url.searchParams.delete(PARAM);
    const maxAge = Math.max(0, payload.x - Math.floor(Date.now() / 1000));

    return new Response(null, {
      status: 302,
      headers: {
        Location: url.toString(),
        "Set-Cookie": `${COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`,
        "Cache-Control": "no-store"
      }
    });
  }

  const existing = readCookie(request, COOKIE);
  if (existing && (await verify(existing, secret))) return;

  return sendToHub();
}

export const config = {
  // Everything except build assets, so a redirect never breaks the page it is
  // trying to protect.
  matcher: ["/((?!assets/|favicon.ico|robots.txt).*)"]
};
