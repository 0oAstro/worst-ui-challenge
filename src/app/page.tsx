export const dynamic = "force-dynamic";

import { Palette } from "lucide-react";
import { SubmissionCard } from "@/components/submission-card";
import { getLatestSubmissions } from "@/lib/voting";

export default async function Home() {
  const submissions = await getLatestSubmissions(6);

  return (
    <main className="container mx-auto px-6 sm:px-8 py-16 sm:py-20 max-w-7xl">
      <div className="text-center mb-16 sm:mb-20">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 sm:mb-8">
          The Worst UI Challenge
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          A curated collection of the most terrible user interfaces ever
          created. Where bad design meets good humor.
        </p>
      </div>

      <div className="mb-12 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-8 sm:mb-12 text-center">
          Latest Submissions
        </h2>
        {submissions && submissions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {submissions.map((submission, index) => (
              <div
                key={submission.id}
                className="relative"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards",
                  opacity: 0,
                  transform: "translateY(20px)",
                }}
              >
                <SubmissionCard submission={submission} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-muted flex items-center justify-center">
              <Palette className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">No submissions yet</h3>
            <p className="text-muted-foreground text-lg">
              Be the first to submit your terrible UI creation.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
