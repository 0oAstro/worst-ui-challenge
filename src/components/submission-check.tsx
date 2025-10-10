"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserSubmission } from "@/app/submission/new/actions";

type SubmissionCheckProps = {
  children: React.ReactNode;
};

export function SubmissionCheck({ children }: SubmissionCheckProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSubmission = async () => {
      try {
        const submission = await getUserSubmission();
        if (submission) {
          router.replace(`/submission/${submission.id}?redirected=true`);
          return;
        }
      } catch (error) {
        console.error("Error checking submission:", error);
      } finally {
        setIsChecking(false);
        setHasChecked(true);
      }
    };

    checkSubmission();
  }, [router]);

  if (isChecking || !hasChecked) {
    return (
      <div className="container mx-auto px-6 sm:px-8 py-16 sm:py-20 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">
              Checking for existing submission...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
