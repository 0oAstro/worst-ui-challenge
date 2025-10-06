"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = { submissionId: string };

const VoteActions = ({ submissionId }: Props) => {
  const [loading, setLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState<boolean | null>(null);
  const [totalVotes, setTotalVotes] = useState<number | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/submission/${submissionId}/vote`, { cache: "no-store" });
      const json = await res.json();
      setHasVoted(Boolean(json.hasVoted));
      if (typeof json.totalVotes === "number") setTotalVotes(json.totalVotes);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId]);

  const handleRequireLogin = () => {
    const next = typeof window !== "undefined" ? window.location.pathname : "/leaderboard";
    window.location.href = `/login?next=${encodeURIComponent(next)}`;
  };

  const handleVote = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/submission/${submissionId}/vote`, { method: "POST" });
      if (res.status === 401) {
        handleRequireLogin();
        return;
      }
      if (!res.ok) return;
      await fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  const handleUnvote = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/submission/${submissionId}/vote`, { method: "DELETE" });
      if (res.status === 401) {
        handleRequireLogin();
        return;
      }
      if (!res.ok) return;
      await fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  const label = hasVoted ? "Unvote" : "Vote";
  const onClick = hasVoted ? handleUnvote : handleVote;

  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label={label}
      className="min-w-24"
    >
      {loading ? "…" : label}
    </Button>
  );
};

export default VoteActions;


