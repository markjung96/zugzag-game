import { auth } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { getSeasonRankings } from "@/lib/db/queries/rankings";
import { AuthError, handleGameError } from "@/lib/errors";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.supabaseToken) throw new AuthError();
    const { id } = await params;
    const supa = createServerClient(session.supabaseToken);
    const rankings = await getSeasonRankings(supa, id);
    return Response.json({ rankings });
  } catch (e) {
    return handleGameError(e);
  }
}
