import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubmissionById, getVoteStatsFor } from "@/lib/voting";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import VoteActions from "@/app/submission/[id]/vote-actions";

type PageProps = {
  params: { id: string };
};

export default async function SubmissionDetailPage({ params }: PageProps) {
  const submission = await getSubmissionById(params.id);
  if (!submission) return notFound();

  const stats = await getVoteStatsFor(submission.id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{submission.title}</h1>
        <Link
          href="/leaderboard"
          className="text-sm underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Back to leaderboard"
        >
          Back
        </Link>
      </div>
      <Separator className="my-4" />

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Total votes</div>
            <div className="text-2xl font-bold tabular-nums">{stats.total_votes}</div>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <a
                href={`https://codepen.io/pen/${submission.id}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Open CodePen"
              >
                Open CodePen
              </a>
            </Button>
            <VoteActions submissionId={submission.id} />
          </div>
        </div>
      </Card>

      <div className="mt-4 rounded-md border">
        <iframe
          height="300"
          style={{ width: "100%" }}
          scrolling="no"
          title={submission.title}
          src={`https://codepen.io/team/codepen/embed/${submission.id}?default-tab=result`}
          frameBorder="no"
          loading="lazy"
          allowFullScreen={true}
        >
          See the Pen{" "}
          <a href={`https://codepen.io/pen/${submission.id}`}>
            {submission.title}
          </a>
          .
        </iframe>
      </div>
    </main>
  );
}


