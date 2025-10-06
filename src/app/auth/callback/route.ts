import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { isValidRedirectPath } from "@/lib/security";

// Handles the OAuth code exchange after redirect from Microsoft
export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  const nextParam = url.searchParams.get("next");
  
  // Validate redirect path to prevent open redirects
  const next = nextParam && isValidRedirectPath(nextParam) ? nextParam : "/leaderboard";

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(errorDescription || error)}`,
        req.url,
      ),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent("Missing OAuth code")}`,
        req.url,
      ),
    );
  }

  const supabase = await createSupabaseServerClient();

  try {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error("Session exchange error:", exchangeError);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, req.url),
      );
    }

    // Check if user was created successfully
    if (data.user) {
      // Update display name if it's Anonymous or null
      const displayName = data.user.user_metadata?.full_name || "Anonymous";
      
      if (displayName && displayName !== 'Anonymous') {
        // Check current profile and update if needed
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', data.user.id)
          .single();
        
        if (!profile || profile.display_name === 'Anonymous' || !profile.display_name) {
          await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              display_name: displayName
            });
        }
      }
      
      // Successful session creation; redirect to main page or intended URL
      return NextResponse.redirect(new URL(next, req.url));
    } else {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent("Failed to create user session")}`, req.url),
      );
    }
  } catch (err) {
    console.error("Unexpected error in auth callback:", err);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("An unexpected error occurred")}`, req.url),
    );
  }
};
