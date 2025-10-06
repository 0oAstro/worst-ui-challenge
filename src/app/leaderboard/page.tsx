import Link from "next/link";
import { getTopSubmissions } from "@/lib/voting";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function LeaderboardPage() {
  const submissions = await getTopSubmissions(20);

  if (!submissions || submissions.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Leaderboard</h1>
        <Separator className="my-4" />
        <p className="text-sm text-muted-foreground">No submissions yet.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Leaderboard</h1>
      <Separator className="my-4" />

      <ul className="space-y-3">
        {submissions.map((s, index) => (
          <li key={s.id}>
            <Card className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-4">
                <span className="w-8 text-center text-sm font-medium tabular-nums">
                  {index + 1}
                </span>
                <div>
                  <Link
                    href={`/submission/${s.id}`}
                    className="text-base font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label={`Open submission ${s.title}`}
                  >
                    {s.title}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-semibold tabular-nums">
                  {s.total_votes}
                </span>
                <span className="text-xs text-muted-foreground">votes</span>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  );
}


