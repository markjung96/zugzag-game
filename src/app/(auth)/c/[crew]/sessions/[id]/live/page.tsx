import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { getSessionRankings } from "@/lib/db/queries/rankings";
import { LiveSessionBoardClient } from "./LiveSessionBoardClient";

export default async function LiveSessionBoardPage({
  params,
}: {
  params: Promise<{ crew: string; id: string }>;
}) {
  const session = await auth();
  if (!session?.supabaseToken) redirect("/login");

  const { id: sessionId } = await params;
  const supa = createServerClient(session.supabaseToken);

  const { data: sessionData } = await supa
    .from("sessions")
    .select("id, name, status, ends_at, season_id, kind")
    .eq("id", sessionId)
    .single();

  if (!sessionData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-text-secondary">세션을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const initialRankings = await getSessionRankings(supa, sessionId);

  return (
    <LiveSessionBoardClient
      sessionId={sessionId}
      sessionName={sessionData.name}
      sessionStatus={sessionData.status}
      sessionEndsAt={sessionData.ends_at}
      sessionKind={sessionData.kind}
      seasonId={sessionData.season_id}
      accessToken={session.supabaseToken}
      initialRankings={initialRankings}
    />
  );
}
