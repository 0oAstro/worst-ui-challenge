"use client";

import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { sanitizeCodepenId, sanitizeCodepenUsername } from "@/lib/security";
import type { SubmissionWithAuthor } from "@/lib/voting";

type SubmissionCardProps = {
  submission: SubmissionWithAuthor;
};

export function SubmissionCard({ submission }: SubmissionCardProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [totalVotes, setTotalVotes] = useState(submission.total_votes);
  const [isVoting, setIsVoting] = useState(false);

  // Fetch initial vote state
  useEffect(() => {
    const fetchVoteState = async () => {
      try {
        const response = await fetch(`/api/submission/${submission.id}/vote`);
        if (response.ok) {
          const data = await response.json();
          setHasVoted(data.hasVoted);
          setTotalVotes(data.totalVotes);
        }
      } catch (error) {
        console.error("Error fetching vote state:", error);
      }
    };

    fetchVoteState();
  }, [submission.id]);

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isVoting) return;

    setIsVoting(true);
    try {
      const response = await fetch(`/api/submission/${submission.id}/vote`, {
        method: hasVoted ? "DELETE" : "POST",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.alreadyVoted !== undefined) {
          setHasVoted(!hasVoted);
          setTotalVotes((prev) => (hasVoted ? prev - 1 : prev + 1));
        } else {
          setHasVoted(!hasVoted);
          setTotalVotes((prev) => (hasVoted ? prev - 1 : prev + 1));
        }
      } else if (response.status === 403) {
        const data = await response.json();
        toast.error(data.error || "You cannot vote for your own submission.");
      } else if (response.status === 401) {
        toast.error("Please log in to vote.");
      } else if (response.status === 429) {
        const data = await response.json();
        toast.error(
          data.error || "Vote limit reached. You can only vote up to 10 times.",
        );
      } else {
        toast.error("Failed to vote. Please try again.");
      }
    } catch (error) {
      console.error("Vote error:", error);
      toast.error("Failed to vote. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card className="group overflow-hidden h-full hover:shadow-xl hover:shadow-primary/10 border-2 border-border/60 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
      <Link href={`/submission/${submission.id}`} className="block">
        <div className="aspect-video overflow-hidden relative">
          <Image
            src={`https://shots.codepen.io/pen/${sanitizeCodepenId(submission.id)}-1280.jpg`}
            alt={submission.title}
            width={600}
            height={338}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            View Details
          </div>
        </div>
      </Link>

      <CardHeader className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link href={`/submission/${submission.id}`}>
              <CardTitle className="text-lg font-semibold leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {submission.title}
              </CardTitle>
            </Link>
            <p className="text-sm text-muted-foreground">
              by {submission.author_name || "Anonymous"}
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <Button
              variant={hasVoted ? "default" : "outline"}
              size="sm"
              onClick={handleVote}
              disabled={isVoting}
              className={`h-8 px-3 ${
                hasVoted
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              <Heart
                className={`w-4 h-4 mr-1 ${hasVoted ? "fill-current" : ""}`}
              />
              {totalVotes}
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
