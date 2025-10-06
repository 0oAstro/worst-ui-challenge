"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const supabase = createSupabaseBrowserClient();
  const searchParams = useSearchParams();

  const handleLoginWithMicrosoft = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const next = searchParams.get("next") ?? "/leaderboard";
    await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        scopes: "openid profile email offline_access User.Read",
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Use your Microsoft account to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full justify-center">
            <Button
              type="button"
              aria-label="Continue with Microsoft"
              onClick={handleLoginWithMicrosoft}
              className="w-full sm:w-auto"
            >
              <Image src="/microsoft.svg" alt="Microsoft" width={16} height={16} className="mr-2 h-4 w-4" aria-hidden="true" />
              Continue with Microsoft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
