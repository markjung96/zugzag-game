/**
 * 기본 점수 정책 시드.
 *
 * 실행: pnpm db:seed --crew-id <uuid> --provider-id <uuid>
 * 접속: POSTGRES_URL_ADMIN (postgres superuser — RLS bypass)
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { scoringPolicies } from "./schema/games";
import type { ColorScores } from "./schema/games";

// ---------------------------------------------------------------------------
// argv parse
// ---------------------------------------------------------------------------

type HoldColor = "white" | "yellow" | "orange" | "green" | "blue" | "red" | "purple" | "black";

const LABEL_ALIASES: Record<HoldColor, string[]> = {
  white: ["white", "흰색", "흰", "백색"],
  yellow: ["yellow", "노란색", "노랑", "노란", "노"],
  orange: ["orange", "주황색", "주황", "주"],
  green: ["green", "초록색", "초록", "초"],
  blue: ["blue", "파란색", "파랑", "파"],
  red: ["red", "빨간색", "빨강", "빨"],
  purple: ["purple", "보라색", "보라", "보"],
  black: ["black", "검은색", "검정색", "검정", "검"],
};

const COLOR_SCORES: Record<HoldColor, number> = {
  white: 10,
  yellow: 20,
  orange: 35,
  green: 60,
  blue: 95,
  red: 140,
  purple: 195,
  black: 260,
};

function parseArgs(): { crewId: string; providerId: string } {
  const args = process.argv.slice(2);
  let crewId: string | undefined;
  let providerId: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--crew-id" && args[i + 1]) {
      crewId = args[++i];
    } else if (args[i] === "--provider-id" && args[i + 1]) {
      providerId = args[++i];
    }
  }

  if (!crewId || !providerId) {
    console.error("Usage: pnpm db:seed --crew-id <uuid> --provider-id <uuid>");
    process.exit(1);
  }

  return { crewId, providerId };
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function buildColorScoresMap(
  providerColors: postgres.RowList<postgres.Row[]>,
): Record<string, number> {
  const colorScoresMap: Record<string, number> = {};
  const holdColors = Object.keys(LABEL_ALIASES) as HoldColor[];
  const missingColors: string[] = [];

  for (const holdColor of holdColors) {
    const aliases = LABEL_ALIASES[holdColor];
    const matched = providerColors.find((pc) =>
      aliases.some((alias) => String(pc.label).toLowerCase() === alias.toLowerCase()),
    );

    if (!matched) {
      missingColors.push(holdColor);
    } else {
      colorScoresMap[String(matched.id)] = COLOR_SCORES[holdColor];
    }
  }

  if (missingColors.length > 0) {
    const labels = providerColors.map((pc) => String(pc.label)).join(", ");
    console.error(`missing color: ${missingColors.join(", ")}. provider_colors labels=[${labels}]`);
    process.exit(1);
  }

  return colorScoresMap;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main() {
  const adminUrl = process.env.POSTGRES_URL_ADMIN;
  if (!adminUrl) {
    console.error("POSTGRES_URL_ADMIN required (see .env.example)");
    process.exit(1);
  }

  const { crewId, providerId } = parseArgs();

  const client = postgres(adminUrl, { max: 1 });
  const db = drizzle(client);

  try {
    const [crew] = await client`SELECT id FROM public.crews WHERE id = ${crewId}`;
    if (!crew) {
      console.error(`crew not found: ${crewId}`);
      process.exit(1);
    }

    const [provider] =
      await client`SELECT id, name FROM public.pass_providers WHERE id = ${providerId}`;
    if (!provider) {
      console.error(`provider not found: ${providerId}`);
      process.exit(1);
    }

    const providerColors = await client`
      SELECT id, label, color_hex
      FROM public.provider_colors
      WHERE provider_id = ${providerId}
      ORDER BY sort_order
    `;

    const colorScoresMap = buildColorScoresMap(providerColors);

    const colorScoresValue: ColorScores = {
      first_send_only: true,
      team_top_n: null,
      color_scores: colorScoresMap,
    };

    const result = await db
      .insert(scoringPolicies)
      .values({
        crewId,
        name: "기본 정책 v1",
        colorScores: colorScoresValue,
        isLocked: false,
      })
      .onConflictDoNothing({
        target: [scoringPolicies.crewId, scoringPolicies.name],
      })
      .returning({ id: scoringPolicies.id });

    if (result.length > 0) {
      console.log(JSON.stringify({ created: true, policyId: result[0].id }));
    } else {
      const [existing] = await client`
        SELECT id FROM games.scoring_policies
        WHERE crew_id = ${crewId} AND name = '기본 정책 v1'
      `;
      console.log(
        JSON.stringify({
          created: false,
          policyId: existing?.id ?? null,
        }),
      );
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
