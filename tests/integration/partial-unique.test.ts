/**
 * Partial UNIQUE 동작 검증 — sends ranked first_send_only + sessions casual_open_one_per_day.
 *
 * 각 테스트는 BEGIN/ROLLBACK 트랜잭션으로 감싸서 DB에 잔여 데이터를 남기지 않는다.
 */

import { describe, it, expect } from "vitest";
import { sql } from "./setup";

describe("partial UNIQUE — sends ranked first_send_only", () => {
  it("rejects duplicate ranked send for same (user, problem, season) with 23505", async () => {
    let caught: { code?: string } | null = null;

    try {
      await sql.begin(async (tx) => {
        // fixture: season + session + problem 필요하므로 전부 생성
        const [crew] = await tx`SELECT id FROM public.crews LIMIT 1`;
        if (!crew) throw new Error("no crew in public.crews — skip");

        const [user] = await tx`SELECT id FROM public.users LIMIT 1`;
        if (!user) throw new Error("no user in public.users — skip");

        // scoring_policy
        const [policy] = await tx`
          INSERT INTO games.scoring_policies (crew_id, name, color_scores)
          VALUES (${crew.id}, 'test-policy-' || gen_random_uuid(), '{"first_send_only":true,"team_top_n":null,"color_scores":{}}')
          RETURNING id
        `;

        // season
        const [season] = await tx`
          INSERT INTO games.seasons (crew_id, name, scoring_policy_id, starts_at, status)
          VALUES (${crew.id}, 'test-season', ${policy.id}, NOW(), 'active')
          RETURNING id
        `;

        // setting_cycle + wall + problem
        const [gym] = await tx`SELECT id FROM public.gyms LIMIT 1`;
        if (!gym) throw new Error("no gym in public.gyms — skip");

        const [cycle] = await tx`
          INSERT INTO games.setting_cycles (gym_id, name, started_at) VALUES (${gym.id}, 'test-cycle', NOW()) RETURNING id
        `;
        const [wall] = await tx`
          INSERT INTO games.walls (gym_id, name) VALUES (${gym.id}, 'test-wall-' || gen_random_uuid()) RETURNING id
        `;

        const [providerColor] = await tx`SELECT id FROM public.provider_colors LIMIT 1`;
        if (!providerColor) throw new Error("no provider_color — skip");

        const [problem] = await tx`
          INSERT INTO games.problems (setting_cycle_id, wall_id, provider_color_id, number)
          VALUES (${cycle.id}, ${wall.id}, ${providerColor.id}, 1)
          RETURNING id
        `;

        // session
        const [session] = await tx`
          INSERT INTO games.sessions (season_id, crew_id, gym_id, name, kind, starts_at, status)
          VALUES (${season.id}, ${crew.id}, ${gym.id}, 'test-session', 'ranked', NOW(), 'live')
          RETURNING id
        `;

        // first send — OK
        await tx`
          INSERT INTO games.sends (user_id, problem_id, season_id, session_id, session_kind, score_snapshot)
          VALUES (${user.id}, ${problem.id}, ${season.id}, ${session.id}, 'ranked', 10)
        `;

        // duplicate — should raise 23505
        await tx`
          INSERT INTO games.sends (user_id, problem_id, season_id, session_id, session_kind, score_snapshot)
          VALUES (${user.id}, ${problem.id}, ${season.id}, ${session.id}, 'ranked', 10)
        `;

        throw new Error("ROLLBACK");
      });
    } catch (err: unknown) {
      caught = err as { code?: string };
    }

    expect(caught).not.toBeNull();
    expect(caught!.code).toBe("23505");
  });

  it("ON CONFLICT DO NOTHING returns 0 rows for duplicate ranked send", async () => {
    try {
      await sql.begin(async (tx) => {
        const [crew] = await tx`SELECT id FROM public.crews LIMIT 1`;
        if (!crew) throw new Error("no crew — skip");

        const [user] = await tx`SELECT id FROM public.users LIMIT 1`;
        if (!user) throw new Error("no user — skip");

        const [policy] = await tx`
          INSERT INTO games.scoring_policies (crew_id, name, color_scores)
          VALUES (${crew.id}, 'test-policy-' || gen_random_uuid(), '{"first_send_only":true,"team_top_n":null,"color_scores":{}}')
          RETURNING id
        `;

        const [season] = await tx`
          INSERT INTO games.seasons (crew_id, name, scoring_policy_id, starts_at, status)
          VALUES (${crew.id}, 'test-season-oc', ${policy.id}, NOW(), 'active')
          RETURNING id
        `;

        const [gym] = await tx`SELECT id FROM public.gyms LIMIT 1`;
        if (!gym) throw new Error("no gym — skip");

        const [cycle] = await tx`
          INSERT INTO games.setting_cycles (gym_id, name, started_at) VALUES (${gym.id}, 'test-cycle-oc', NOW()) RETURNING id
        `;
        const [wall] = await tx`
          INSERT INTO games.walls (gym_id, name) VALUES (${gym.id}, 'test-wall-oc-' || gen_random_uuid()) RETURNING id
        `;
        const [providerColor] = await tx`SELECT id FROM public.provider_colors LIMIT 1`;
        if (!providerColor) throw new Error("no provider_color — skip");

        const [problem] = await tx`
          INSERT INTO games.problems (setting_cycle_id, wall_id, provider_color_id, number)
          VALUES (${cycle.id}, ${wall.id}, ${providerColor.id}, 1)
          RETURNING id
        `;

        const [session] = await tx`
          INSERT INTO games.sessions (season_id, crew_id, gym_id, name, kind, starts_at, status)
          VALUES (${season.id}, ${crew.id}, ${gym.id}, 'test-session-oc', 'ranked', NOW(), 'live')
          RETURNING id
        `;

        await tx`
          INSERT INTO games.sends (user_id, problem_id, season_id, session_id, session_kind, score_snapshot)
          VALUES (${user.id}, ${problem.id}, ${season.id}, ${session.id}, 'ranked', 10)
        `;

        const result = await tx`
          INSERT INTO games.sends (user_id, problem_id, season_id, session_id, session_kind, score_snapshot)
          VALUES (${user.id}, ${problem.id}, ${season.id}, ${session.id}, 'ranked', 10)
          ON CONFLICT (user_id, problem_id, season_id) WHERE cancelled_at IS NULL AND session_kind = 'ranked'
          DO NOTHING
          RETURNING id
        `;

        expect(result.length).toBe(0);

        throw new Error("ROLLBACK");
      });
    } catch (err: unknown) {
      if ((err as Error).message !== "ROLLBACK") throw err;
    }
  });
});

describe("partial UNIQUE — casual_open_one_per_day", () => {
  it("rejects duplicate casual_open on same day with 23505", async () => {
    let caught: { code?: string } | null = null;

    try {
      await sql.begin(async (tx) => {
        const [crew] = await tx`SELECT id FROM public.crews LIMIT 1`;
        if (!crew) throw new Error("no crew — skip");

        const [policy] = await tx`
          INSERT INTO games.scoring_policies (crew_id, name, color_scores)
          VALUES (${crew.id}, 'test-policy-co-' || gen_random_uuid(), '{"first_send_only":true,"team_top_n":null,"color_scores":{}}')
          RETURNING id
        `;

        const [season] = await tx`
          INSERT INTO games.seasons (crew_id, name, scoring_policy_id, starts_at, status)
          VALUES (${crew.id}, 'test-season-co', ${policy.id}, NOW(), 'active')
          RETURNING id
        `;

        const [gym] = await tx`SELECT id FROM public.gyms LIMIT 1`;
        if (!gym) throw new Error("no gym — skip");

        const startsAt = "2026-06-15T14:00:00+09:00";

        await tx`
          INSERT INTO games.sessions (season_id, crew_id, gym_id, name, kind, starts_at, status)
          VALUES (${season.id}, ${crew.id}, ${gym.id}, 'casual-1', 'casual_open', ${startsAt}::timestamptz, 'live')
        `;

        await tx`
          INSERT INTO games.sessions (season_id, crew_id, gym_id, name, kind, starts_at, status)
          VALUES (${season.id}, ${crew.id}, ${gym.id}, 'casual-2', 'casual_open', ${startsAt}::timestamptz, 'live')
        `;

        throw new Error("ROLLBACK");
      });
    } catch (err: unknown) {
      caught = err as { code?: string };
    }

    expect(caught).not.toBeNull();
    expect(caught!.code).toBe("23505");
  });
});
