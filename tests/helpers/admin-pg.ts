import postgres from "postgres";

if (!process.env.POSTGRES_URL_ADMIN)
  throw new Error("POSTGRES_URL_ADMIN required for e2e admin helpers");

const sql = postgres(process.env.POSTGRES_URL_ADMIN, { max: 4 });

export async function adminQuery<T>(q: string): Promise<T> {
  return (await sql.unsafe(q))[0] as T;
}

export async function adminInsertSend(opts: {
  sequenceIndex: number;
  userId?: string;
  problemId?: string;
  seasonId?: string;
  sessionId?: string;
}): Promise<{ id: string; created_at: string }> {
  const userId = opts.userId ?? process.env.SEED_TEST_USER_ID!;
  const problemId = opts.problemId ?? process.env.SEED_TEST_PROBLEM_ID!;
  const seasonId = opts.seasonId ?? process.env.SEED_TEST_SEASON_ID!;
  const sessionId = opts.sessionId ?? process.env.SEED_TEST_SESSION_ID!;

  const [row] = await sql<Array<{ id: string; created_at: string }>>`
    INSERT INTO games.sends (user_id, problem_id, season_id, session_id, session_kind, score_snapshot)
    VALUES (${userId}, ${problemId}, ${seasonId}, ${sessionId}, 'ranked', ${10 + opts.sequenceIndex})
    RETURNING id, to_jsonb(created_at)::text AS created_at;
  `;
  // R4-M4: ::text cast ensures postgres-js returns raw quoted string (OID 25)
  // instead of auto-parsing OID 3802 (jsonb). Strip surrounding quotes.
  row.created_at = row.created_at.replace(/^"|"$/g, "");
  return row;
}

export async function adminCleanup() {
  await sql.end({ timeout: 5 });
}
