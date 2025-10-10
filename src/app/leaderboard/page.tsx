export const dynamic = "force-dynamic";

import { Trophy } from "lucide-react";
import { LeaderboardCard } from "@/components/leaderboard-card";
import { getTopSubmissions } from "@/lib/voting";

export default async function LeaderboardPage() {
  const submissions = await getTopSubmissions(10);

  if (!submissions || submissions.length === 0) {
    return (
      <main className="container mx-auto px-6 sm:px-8 py-16 sm:py-20 max-w-4xl">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 sm:mb-8">
            Leaderboard
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Top performing terrible UI submissions
          </p>
        </div>
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-muted flex items-center justify-center">
            <Trophy className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-semibold mb-3">No submissions yet</h3>
          <p className="text-muted-foreground text-lg">
            Submit your terrible UI to see it on the leaderboard.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-6 sm:px-8 py-16 sm:py-20 max-w-4xl">
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 sm:mb-8">
          Leaderboard
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground">
          Top performing terrible UI submissions
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {submissions.map((submission, index) => (
          <LeaderboardCard
            key={submission.id}
            submission={submission}
            rank={index + 1}
          />
        ))}
      </div>
    </main>
  );
}
