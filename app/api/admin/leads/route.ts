import { failure, reply, requireOwner } from "../../../../lib/admin/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const columns = "id,name,email,phone,instagram,skate_type,answers,level,score,gift,marketing,consent,test_version,created_at,career_interest,zone,mentorship_opt_in";
export async function GET(request: Request) {
  try {
    const client = await requireOwner();
    const offset = Number(new URL(request.url).searchParams.get("offset") ?? 0);
    if (!Number.isSafeInteger(offset) || offset < 0) return reply({ error: "Página no válida." }, 400);
    const { data, error, count } = await client.from("halloween_leads").select(columns, { count: "exact" }).order("created_at", { ascending: false }).order("id", { ascending: false }).range(offset, offset + 199);
    if (error || !data || count === null) return reply({ error: "La lectura privada no está disponible. Revisá el permiso de la cuenta." }, 503);
    return reply({ leads: data, total: count, nextOffset: offset + data.length < count ? offset + data.length : null });
  } catch (error) { return failure(error); }
}
