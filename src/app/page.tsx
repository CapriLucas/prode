import { MatchBrowser } from "@/components/matches/match-browser";
import { getMatches, matchPhases } from "@/domain/matches/matches";

export default function Home() {
  const matches = getMatches();

  return (
    <main className="min-h-screen">
      <MatchBrowser matches={matches} phases={matchPhases} />
    </main>
  );
}
