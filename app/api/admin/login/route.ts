import { adminClient, adminOrigin, AdminError, failure, loginBody, reply, sameOrigin } from "../../../../lib/admin/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return reply({ error: "Solicitud no permitida." }, 403);
  try {
    const { email } = await loginBody(request);
    const { client, setup } = await adminClient({ allowSetup: true });
    // Standard Magic Link + PKCE, using the project's existing email template.
    // A temporary operator flag can provision only the configured owner inbox.
    // No reader accepts email as authorization; it always requires the pinned UUID.
    const { error } = await client.auth.signInWithOtp({ email, options: { shouldCreateUser: setup, emailRedirectTo: `${adminOrigin()}/api/admin/callback` } });
    if (error) throw new AdminError(error.status === 429 ? 429 : 503, error.status === 429 ? "Esperá un minuto antes de pedir otro código." : "No se pudo enviar el código. Revisá la habilitación del acceso.");
    return reply({ ok: true });
  } catch (error) { return failure(error); }
}
