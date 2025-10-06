import { getTopSubmissions } from "@/lib/voting";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default async function Home() {
  const submissions = await getTopSubmissions(5);

  return (
    <main className="container mx-auto px-4 py-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold">The Worst UI Challenge</h1>
        <p className="text-lg text-muted-foreground mt-2">
          A collection of the most terrible user interfaces ever created.
        </p>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Top Submissions</h2>
        {submissions && submissions.length > 0 ? (
          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              {submissions.map((submission) => (
                <CarouselItem key={submission.id}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <h3 className="text-xl font-semibold mb-4">{submission.title}</h3>
                        <div className="w-full rounded-md border overflow-hidden">
                          <iframe
                            height="300"
                            style={{ width: "100%" }}
                            scrolling="no"
                            title={submission.title}
                            src={`https://codepen.io/team/codepen/embed/${submission.id}?default-tab=result`}
                            frameBorder="no"
                            loading="lazy"
                            allowFullScreen={true}
                          >
                            See the Pen{" "}
                            <a href={`https://codepen.io/pen/${submission.id}`}>
                              {submission.title}
                            </a>
                            .
                          </iframe>
                        </div>
                        <Link href={`/submission/${submission.id}`} className="mt-4 text-sm underline">
                          View Details
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : (
          <p className="text-center text-muted-foreground">No submissions yet.</p>
        )}
      </div>
    </main>
  );
}