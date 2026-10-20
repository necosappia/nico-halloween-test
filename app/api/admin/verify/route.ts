import { adminClient, AdminError, failure, loginBody, reply, sameOrigin } from "../../../../lib/admin/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return reply({ error: "Solicitud no permitida." }, 403);
  try {
    const { email, token } = await loginBody(request, true);
    const { client, ownerId } = await adminClient();
    const { error } = await client.auth.verifyOtp({ email, token: token!, type: "email" });
    if (error) throw new AdminError(error.status === 429 ? 429 : 400, error.status === 429 ? "Demasiados intentos. Esperá un minuto antes de volver a probar." : "El código es incorrecto o venció. Revisalo o pedí uno nuevo.");
    const { data: { user }, error: verifiedError } = await client.auth.getUser();
    if (verifiedError || !user || !user.email_confirmed_at || user.id !== ownerId) {
      await client.auth.signOut({ scope: "local" });
      throw new AdminError(403, "Esta cuenta no tiene acceso al panel.");
    }
    return reply({ ok: true });
  } catch (error) { return failure(error); }
}
