import { notFound } from "next/navigation";
import { getSubmissionById, getVoteStatsFor } from "@/lib/voting";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import SubmissionDetailClient from "./SubmissionDetailClient";

type PageProps = {
  params: { id: string };
};

export default async function SubmissionDetailPage({ params }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { id } = await params;
  const submission = await getSubmissionById(id);
  if (!submission) return notFound();

  const stats = await getVoteStatsFor(submission.id);
  const isOwner = user?.id === submission.user_id;

  return (
    <SubmissionDetailClient
      submission={submission}
      stats={stats}
      isOwner={isOwner}
    />
  );
}
