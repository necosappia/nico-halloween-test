import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

export function reply(body: unknown, status = 200) {
  return Response.json(body, { status, headers: privateHeaders });
}

export function sameOrigin(request: Request) {
  // Explicit origin: reverse proxies may normalize request.url to localhost.
  const expected = process.env.HALLOWEEN_ADMIN_ORIGIN;
  return !!expected && request.headers.get("origin") === expected &&
    request.headers.get("sec-fetch-site") !== "cross-site";
}

export class AdminError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function failure(error: unknown) {
  return error instanceof AdminError
    ? reply({ error: error.message }, error.status)
    : reply({ error: "No se pudo consultar el panel. Intentá nuevamente." }, 503);
}

export async function adminClient(options: { allowSetup?: boolean } = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  const ownerId = process.env.HALLOWEEN_OWNER_USER_ID;
  const validOwner = !!ownerId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ownerId);
  const setup = options.allowSetup === true && process.env.HALLOWEEN_OWNER_SETUP === "1" && !ownerId;
  if (!url || !key || (!validOwner && !setup)) {
    throw new AdminError(503, "El acceso privado todavía no está habilitado.");
  }
  // The only production backend is the existing Halloween project.
  if (process.env.NODE_ENV === "production" && url.replace(/\/$/, "") !== "https://vlljxfzcflfksdtqsyib.supabase.co") {
    throw new AdminError(503, "La configuración del acceso necesita revisión.");
  }
  // Never accept a privileged API key in this reader, even through misconfiguration.
  if (key.startsWith("sb_secret_")) throw new AdminError(503, "La configuración del acceso necesita revisión.");
  if (key.startsWith("ey")) {
    try {
      if (JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role !== "anon") throw Error();
    } catch { throw new AdminError(503, "La configuración del acceso necesita revisión."); }
  }
  const jar = await cookies();
  const client = createServerClient(url, key, {
    cookieOptions: { name: "halloween-admin", httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/api/admin" },
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (values) => values.forEach(({ name, value, options }) => jar.set(name, value, { ...options, sameSite: name.endsWith("code-verifier") ? "lax" : "strict" })),
    },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
  return { client, ownerId, setup };
}

export async function requireOwner() {
  const { client, ownerId } = await adminClient();
  // Network verification with Auth, not cookie contents or editable user_metadata.
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new AdminError(401, "Ingresá para ver los resultados.");
  if (user.id !== ownerId || !user.email_confirmed_at) throw new AdminError(403, "Esta cuenta no tiene acceso al panel.");
  return client;
}

export function ownerEmail() {
  const email = process.env.HALLOWEEN_OWNER_EMAIL?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AdminError(503, "El acceso privado todavía no está habilitado.");
  return email;
}

export function adminOrigin() {
  const value = process.env.HALLOWEEN_ADMIN_ORIGIN;
  if (!value) throw new AdminError(503, "El acceso privado todavía no está habilitado.");
  const url = new URL(value);
  if (url.origin !== value || (process.env.NODE_ENV === "production" && url.protocol !== "https:")) throw new AdminError(503, "La configuración del acceso necesita revisión.");
  return value;
}

export async function loginBody(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json") || Number(request.headers.get("content-length") ?? 0) > 1000) throw new AdminError(400, "Solicitud no válida.");
  const text = await request.text();
  if (text.length > 1000) throw new AdminError(400, "Solicitud no válida.");
  let body: { email?: unknown };
  try { body = JSON.parse(text); } catch { throw new AdminError(400, "Solicitud no válida."); }
  if (!body || typeof body.email !== "string" || body.email.length > 254 || body.email.trim().toLowerCase() !== ownerEmail()) throw new AdminError(403, "Esta cuenta no tiene acceso al panel.");
  return { email: ownerEmail() };
}
