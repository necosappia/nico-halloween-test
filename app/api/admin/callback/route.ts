import { adminClient, adminOrigin, failure, ownerEmail, privateHeaders } from "../../../../lib/admin/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const target = new URL("/admin", adminOrigin());
    const finish = (status: string) => {
      target.searchParams.set("access", status);
      return new Response(null, { status: 303, headers: { ...privateHeaders, Location: target.toString() } });
    };
    const code = new URL(request.url).searchParams.get("code");
    if (!code || !/^[A-Za-z0-9_-]{8,512}$/.test(code)) return finish("invalid-link");
    const { client, ownerId, setup } = await adminClient({ allowSetup: true });
    // Supabase checks the one-use auth code AND the browser's PKCE verifier.
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) return finish("invalid-link");
    const { data: { user }, error: verifiedError } = await client.auth.getUser();
    if (verifiedError || !user || !user.email_confirmed_at || (setup ? user.email?.toLowerCase() !== ownerEmail() : user.id !== ownerId)) {
      await client.auth.signOut({ scope: "local" });
      return finish("denied");
    }
    if (setup) {
      // Email confirmation completes provisioning only. It never grants data access.
      await client.auth.signOut({ scope: "local" });
      return finish("setup-confirmed");
    }
    return finish("ok");
  } catch (error) { return failure(error); }
}
