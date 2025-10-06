"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";
import { sanitizeCodepenId } from "@/lib/security";
import type { SubmissionWithAuthor } from "@/lib/voting";

type LeaderboardCardProps = {
  submission: SubmissionWithAuthor;
  rank: number;
};

export function LeaderboardCard({ submission, rank }: LeaderboardCardProps) {
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
          setTotalVotes(prev => hasVoted ? prev - 1 : prev + 1);
        } else {
          setHasVoted(!hasVoted);
          setTotalVotes(prev => hasVoted ? prev - 1 : prev + 1);
        }
      } else if (response.status === 403) {
        const data = await response.json();
        toast.error(data.error || "You cannot vote for your own submission.");
      } else if (response.status === 401) {
        toast.error("Please log in to vote.");
      } else if (response.status === 429) {
        const data = await response.json();
        toast.error(data.error || "Vote limit reached. You can only vote up to 10 times.");
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
    <Link
      href={`/submission/${submission.id}`}
      key={submission.id}
      aria-label={`Open submission ${submission.title}`}
      className="block"
    >
      <Card className="group hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
            <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-primary/20 text-primary font-bold text-lg flex-shrink-0">
              {rank}
            </div>
            <div className="relative overflow-hidden rounded-lg border flex-shrink-0 w-20 h-12">
              <Image
                src={`https://shots.codepen.io/pen/${sanitizeCodepenId(submission.id)}-320.jpg`}
                alt={submission.title}
                width={80}
                height={48}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold leading-tight mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                {submission.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                by {submission.author_name || "Anonymous"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-right shrink-0 ml-4">
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
              <Heart className={`w-4 h-4 mr-1 ${hasVoted ? "fill-current" : ""}`} />
              {totalVotes}
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
