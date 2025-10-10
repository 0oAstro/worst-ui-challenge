import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 },
    );
  }

  try {
    // Try multiple user agents and headers to bypass restrictions
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ];

    let lastError: Error | undefined;

    for (const userAgent of userAgents) {
      try {
        const response = await fetch(imageUrl, {
          headers: {
            "User-Agent": userAgent,
            Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            DNT: "1",
            Connection: "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "image",
            "Sec-Fetch-Mode": "no-cors",
            "Sec-Fetch-Site": "cross-site",
            Referer: "https://codepen.io/",
          },
          // Add timeout
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        if (response.ok) {
          const imageBuffer = await response.arrayBuffer();
          const contentType =
            response.headers.get("content-type") || "image/jpeg";

          return new NextResponse(imageBuffer, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=3600", // Cache for 1 hour
              "Access-Control-Allow-Origin": "*",
            },
          });
        }

        lastError = new Error(
          `HTTP ${response.status}: ${response.statusText}`,
        );
      } catch (error) {
        lastError = error;
      }
    }

    // If all attempts failed, return a 404 with a fallback message
    console.error("All image proxy attempts failed:", lastError);
    return NextResponse.json(
      {
        error: "Image not available",
        fallback: true,
      },
      { status: 404 },
    );
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        fallback: true,
      },
      { status: 500 },
    );
  }
}
