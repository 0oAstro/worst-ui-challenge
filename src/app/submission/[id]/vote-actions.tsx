"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { submissionId: string };

const VoteActions = ({ submissionId }: Props) => {
  const [loading, setLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState<boolean | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/submission/${submissionId}/vote`, {
        cache: "no-store",
      });
      const json = await res.json();
      setHasVoted(Boolean(json.hasVoted));
    } catch {
      // ignore
    }
  }, [submissionId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleRequireLogin = () => {
    const next =
      typeof window !== "undefined" ? window.location.pathname : "/leaderboard";
    window.location.href = `/login?next=${encodeURIComponent(next)}`;
  };

  const handleVote = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/submission/${submissionId}/vote`, {
        method: "POST",
      });
      if (res.status === 401) {
        handleRequireLogin();
        return;
      }
      if (res.status === 403) {
        const { error } = await res.json();
        toast.error(error || "You cannot perform this action.");
        return;
      }
      if (res.status === 429) {
        const { error } = await res.json();
        toast.error(error || "Vote limit reached.");
        return;
      }
      if (!res.ok) {
        toast.error("Something went wrong. Please try again.");
        return;
      }
      await fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  const handleUnvote = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/submission/${submissionId}/vote`, {
        method: "DELETE",
      });
      if (res.status === 401) {
        handleRequireLogin();
        return;
      }
      if (!res.ok) {
        toast.error("Something went wrong. Please try again.");
        return;
      }
      await fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  const label = hasVoted ? "Unvote" : "Vote";
  const onClick = hasVoted ? handleUnvote : handleVote;
  const Icon = hasVoted ? ThumbsDown : ThumbsUp;

  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={loading || hasVoted === null}
      aria-label={label}
      className="min-w-28"
    >
      <Icon className="w-4 h-4 mr-2" />
      {loading ? "…" : label}
    </Button>
  );
};

export default VoteActions;
