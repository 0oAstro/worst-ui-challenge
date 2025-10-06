"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { isValidRedirectPath } from "@/lib/security";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const supabase = createSupabaseBrowserClient();
  const searchParams = useSearchParams();

  const handleLoginWithMicrosoft = async () => {
    // Use current origin for both development and production
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const nextParam = searchParams.get("next");
    
    // Validate redirect path to prevent open redirects
    const next = nextParam && isValidRedirectPath(nextParam) ? nextParam : "/leaderboard";
    
    await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        scopes: "openid profile email offline_access User.Read",
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  return (
    <div className={cn("w-full max-w-md mx-auto", className)} {...props}>
      <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-8 shadow-xl w-full">
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in to continue to your account
              </p>
            </div>
          </div>

          {/* Login Button */}
          <div className="pt-2">
            <Button
              type="button"
              aria-label="Continue with Microsoft"
              onClick={handleLoginWithMicrosoft}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              <div className="flex items-center justify-center gap-3">
                <Image
                  src="/microsoft.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="w-5 h-5"
                  aria-hidden="true"
                />
                <span>Continue with Microsoft</span>
              </div>
            </Button>
          </div>

          {/* Footer */}
          <div className="pt-4">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our terms of service and privacy policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
