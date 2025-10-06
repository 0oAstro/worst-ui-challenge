import { createSupabaseServerClient } from "@/utils/supabase/server";

export type Submission = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type Vote = {
  id: string;
  submission_id: string;
  voter_id: string;
  created_at: string;
};

export type SubmissionVoteStats = {
  submission_id: string;
  total_votes: number;
};

export const getTopSubmissions = async (limit: number = 10) => {
  const supabase = await createSupabaseServerClient();
  const capped = Math.max(1, Math.min(100, Number(limit) || 10));
  const { data, error } = await supabase.rpc("get_top_submissions", {
    limit_count: capped,
  });
  if (error) throw new Error(error.message);
  return data as Array<Pick<Submission, "id" | "user_id" | "title" | "created_at"> & { total_votes: number }>;
};

export const getSubmissionById = async (submissionId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("id,user_id,title,created_at,updated_at")
    .eq("id", submissionId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Submission | null;
};

export const createSubmission = async (params: {
  id: string;
  title: string;
}) => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) throw new Error(authError.message);
  if (!user) throw new Error("Unauthorized");

  const payload = {
    id: params.id,
    user_id: user.id,
    title: params.title,
  };

  const { data, error } = await supabase
    .from("submissions")
    .insert(payload)
    .select("id,user_id,title,created_at,updated_at")
    .single();
  if (error) throw new Error(error.message);
  return data as Submission;
};

export const deleteOwnSubmission = async (submissionId: string) => {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("submissions")
    .delete()
    .eq("id", submissionId);
  if (error) throw new Error(error.message);
};

export const getVoteStatsFor = async (submissionId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("submission_vote_stats")
    .select("submission_id,total_votes")
    .eq("submission_id", submissionId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (
    (data as SubmissionVoteStats | null) ?? {
      submission_id: submissionId,
      total_votes: 0,
    }
  );
};

export const hasUserVoted = async (submissionId: string) => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data, error } = await supabase
    .from("votes")
    .select("id")
    .eq("submission_id", submissionId)
    .eq("voter_id", user.id)
    .maybeSingle();
  if (error) {
    const code = (error as { code?: string }).code;
    if (!code || code !== "PGRST116") throw new Error(error.message);
  }
  return Boolean(data);
};

export const castVote = async (submissionId: string) => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) throw new Error(authError.message);
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("votes").insert({
    submission_id: submissionId,
    voter_id: user.id,
  } satisfies Partial<Vote>);

  if (error) {
    const code = (error as { code?: string }).code;
    if (code === "23505") return { alreadyVoted: true } as const;
    throw new Error(error.message);
  }
  return { alreadyVoted: false } as const;
};

export const revokeVote = async (submissionId: string) => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) throw new Error(authError.message);
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("votes")
    .delete()
    .eq("submission_id", submissionId)
    .eq("voter_id", user.id);
  if (error) throw new Error(error.message);
};
