import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { getSeasonRankings } from "@/lib/db/queries/rankings";
import { LiveBoardClient } from "./LiveBoardClient";

export default async function LiveBoardPage({ params }: { params: Promise<{ crew: string }> }) {
  const session = await auth();
  if (!session?.supabaseToken) redirect("/login");

  const { crew } = await params;
  const supa = createServerClient(session.supabaseToken);

  const { data: seasonData } = await supa
    .from("seasons")
    .select("id")
    .eq("crew_id", crew)
    .eq("status", "active")
    .limit(1)
    .single();

  const seasonId = seasonData?.id;
  if (!seasonId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-text-secondary">활성 시즌이 없습니다.</p>
      </div>
    );
  }

  const initialRankings = await getSeasonRankings(supa, seasonId);

  return (
    <LiveBoardClient
      seasonId={seasonId}
      accessToken={session.supabaseToken}
      initialRankings={initialRankings}
    />
  );
}
