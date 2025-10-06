import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

// Handles the OAuth code exchange after redirect from Microsoft
export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/leaderboard";

  if (!code) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent("Missing OAuth code")}`,
        req.url,
      ),
    );
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, req.url),
    );
  }

  // Successful session creation; redirect to main page or intended URL
  return NextResponse.redirect(new URL(next, req.url));
};
