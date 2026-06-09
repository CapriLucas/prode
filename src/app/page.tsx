import { MatchBrowser } from "@/components/matches/match-browser";
import { matchPhases } from "@/domain/matches/matches";
import { getPersistedMatches } from "@/domain/matches/repository";
import { buildMatchReviewItems } from "@/domain/review/review";
import { getCompletionRecords } from "@/domain/completions/repository";

export const dynamic = "force-dynamic";

export default async function Home() {
  const matches = await getPersistedMatches();
  const completionRecords = await getCompletionRecords();

  return (
    <main className="min-h-screen">
      <MatchBrowser
        initialCompletionRecords={completionRecords}
        matches={matches}
        phases={matchPhases}
        reviewItems={await buildMatchReviewItems(matches)}
      />
    </main>
  );
}
