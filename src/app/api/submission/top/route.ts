import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit");
  const limit = Math.max(1, Math.min(100, Number(limitParam) || 10));

  const supabase = await createSupabaseServerClient();

  // Prefer RPC to leverage view ordering and limit inside DB
  const { data, error } = await supabase.rpc("get_top_submissions", {
    limit_count: limit,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submissions: data }, { status: 200 });
};
