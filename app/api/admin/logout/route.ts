import { adminClient, failure, reply, sameOrigin } from "../../../../lib/admin/server";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return reply({ error: "Solicitud no permitida." }, 403);
  try {
    const { client } = await adminClient();
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) return reply({ error: "No se pudo cerrar la sesión. Reintentá." }, 503);
    return reply({ ok: true });
  } catch (error) { return failure(error); }
}
