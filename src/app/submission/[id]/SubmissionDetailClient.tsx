"use client";

import { ArrowLeft, Code, ExternalLink, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import VoteActions from "@/app/submission/[id]/vote-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  createSafeCodepenEmbedUrl,
  createSafeCodepenPenUrl,
} from "@/lib/security";
import type { SubmissionWithAuthor } from "@/lib/voting";

type SubmissionStats = {
  total_votes: number;
};

type SubmissionDetailClientProps = {
  submission: SubmissionWithAuthor;
  stats: SubmissionStats;
  isOwner: boolean;
};

export default function SubmissionDetailClient({
  submission,
  stats,
  isOwner,
}: SubmissionDetailClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const toastShown = useRef(false);

  useEffect(() => {
    const checkRedirect = () => {
      if (searchParams.get("redirected") === "true" && !toastShown.current) {
        toast.info(
          "You already have a submission. Edit it on CodePen to reflect changes here.",
        );
        toastShown.current = true;
      }
    };
    checkRedirect();
  }, [searchParams]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/submission/${submission.id}/delete`, {
        method: "POST",
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to delete submission.");
      }
      toast.success("Submission deleted successfully!");
      router.push("/leaderboard");
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="container mx-auto px-6 sm:px-8 py-16 sm:py-20 max-w-5xl">
      <div className="mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
            {submission.title}
          </h1>
          <Link
            href="/leaderboard"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 self-start sm:self-auto"
            aria-label="Back to leaderboard"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Leaderboard
          </Link>
        </div>
        <Separator />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 mb-8 sm:mb-12">
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Total Votes
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold tabular-nums text-primary">
                    {stats.total_votes}
                  </div>
                </div>
                <VoteActions submissionId={submission.id} />
              </div>

              {isOwner && (
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        disabled={isDeleting}
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Submission
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action is permanent and all votes will be lost.
                          We recommend editing your Pen on CodePen instead, as
                          changes will be reflected here automatically.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Yes, delete it"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <a
                      href={createSafeCodepenPenUrl(
                        submission.codepen_username,
                        submission.id,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Open CodePen"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in CodePen
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-fit">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-6">Submission Details</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Author
                    </div>
                    <div className="font-medium">
                      {submission.author_name || "Anonymous"}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Code className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      CodePen Username
                    </div>
                    <div className="font-medium">
                      {submission.codepen_username}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="relative h-0 overflow-hidden pb-[56.25%]">
          <iframe
            className="absolute left-0 top-0 h-full w-full"
            scrolling="no"
            title={submission.title}
            src={createSafeCodepenEmbedUrl(
              submission.codepen_username,
              submission.id,
            )}
            frameBorder="no"
            loading="lazy"
            allowFullScreen={true}
          >
            See the Pen{" "}
            <a
              href={createSafeCodepenPenUrl(
                submission.codepen_username,
                submission.id,
              )}
            >
              {submission.title}
            </a>
            .
          </iframe>
        </div>
      </Card>
    </main>
  );
}
