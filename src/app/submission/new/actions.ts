"use server";

import { getSubmissionByUserId } from "@/lib/voting";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export async function getUserSubmission() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return getSubmissionByUserId(user.id);
}

export async function createSubmissionAction(params: {
  id: string;
  title: string;
  codepen_username: string;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  
  if (authError) {
    throw new Error(authError.message);
  }
  
  if (!user) {
    throw new Error("You must be signed in to submit.");
  }

  const { data, error } = await supabase
    .from("submissions")
    .insert({
      id: params.id,
      user_id: user.id,
      title: params.title.trim(),
      codepen_username: params.codepen_username,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message ?? "Failed to create submission.");
  }

  return data;
}
