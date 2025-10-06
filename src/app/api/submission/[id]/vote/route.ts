import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id: submissionId } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // total votes via view
  const { data: stats, error: statsError } = await supabase
    .from("submission_vote_stats")
    .select("total_votes")
    .eq("submission_id", submissionId)
    .maybeSingle();
  if (statsError) {
    return NextResponse.json({ error: statsError.message }, { status: 500 });
  }

  let hasVoted = false;
  if (user) {
    const { data: voteRow, error: voteError } = await supabase
      .from("votes")
      .select("id")
      .eq("submission_id", submissionId)
      .eq("voter_id", user.id)
      .maybeSingle();
    if (voteError && voteError.code !== "PGRST116") {
      // ignore not found; surface other errors
      return NextResponse.json({ error: voteError.message }, { status: 500 });
    }
    hasVoted = Boolean(voteRow);
  }

  return NextResponse.json(
    {
      submissionId,
      hasVoted,
      totalVotes: stats?.total_votes ?? 0,
    },
    { status: 200 },
  );
};

export const POST = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id: submissionId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is voting for their own submission
  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select("user_id")
    .eq("id", submissionId)
    .single();

  if (submissionError) {
    return NextResponse.json(
      { error: submissionError.message },
      { status: 500 },
    );
  }

  if (submission.user_id === user.id) {
    return NextResponse.json(
      { error: "You cannot vote for your own submission." },
      { status: 403 },
    );
  }

  // Check user's total votes
  const { count, error: countError } = await supabase
    .from("votes")
    .select("id", { count: "exact", head: true })
    .eq("voter_id", user.id);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if (count !== null && count >= 10) {
    return NextResponse.json(
      { error: "Vote limit reached. You can only vote up to 10 times." },
      { status: 429 },
    );
  }

  const { error } = await supabase
    .from("votes")
    .insert({ submission_id: submissionId, voter_id: user.id });

  if (error) {
    const code = (error as { code?: string }).code;
    if (code === "23505") {
      return NextResponse.json({ alreadyVoted: true }, { status: 200 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ alreadyVoted: false }, { status: 201 });
};

export const DELETE = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id: submissionId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("votes")
    .delete()
    .eq("submission_id", submissionId)
    .eq("voter_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
};
