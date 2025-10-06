"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createSubmissionAction } from "./actions";
import { createSafeCodepenEmbedUrl, createSafeCodepenPenUrl } from "@/lib/security";
import { SubmissionCheck } from "@/components/submission-check";

type ValidationErrors = {
  title?: string;
  codepen_url?: string;
  form?: string;
};

const extractCodepenInfo = (
  value: string,
): { username: string | null; penId: string | null } => {
  try {
    const url = new URL(value);
    if (!/(^|\.)codepen\.io$/i.test(url.hostname)) {
      return { username: null, penId: null };
    }
    const path = url.pathname.replace(/\/+$/, "");
    const parts = path.split("/").filter(Boolean); // e.g. ["user", "pen", "hash"]

    // Standard format: /username/pen/hash
    if (parts.length >= 3 && parts[1].toLowerCase() === "pen") {
      const username = parts[0];
      const penId = parts[2];
      return { username, penId };
    }

    // Simpler format: /pen/hash (assuming anonymous user)
    if (parts.length >= 2 && parts[0].toLowerCase() === "pen") {
      const username = "anon"; // Default to 'anon' if username is not in URL
      const penId = parts[1];
      return { username, penId };
    }

    return { username: null, penId: null };
  } catch {
    return { username: null, penId: null };
  }
};

const isValidCodepenUrl = (value: string): boolean => {
  const { penId, username } = extractCodepenInfo(value);
  return Boolean(penId && username);
};

export default function NewSubmissionPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [codepenUrl, setCodepenUrl] = useState("");
  const [penId, setPenId] = useState<string | null>(null);
  const [codepenUsername, setCodepenUsername] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const canSubmit = useMemo(() => {
    if (title.trim().length < 3 || title.trim().length > 120) return false;
    if (!penId || !codepenUsername) return false;
    return true;
  }, [title, penId, codepenUsername]);

  const handleFetchPen = () => {
    const { penId, username } = extractCodepenInfo(codepenUrl);
    setPenId(penId);
    setCodepenUsername(username);

    if (!penId || !username) {
      setErrors((prev) => ({
        ...prev,
        codepen_url:
          "Enter a valid CodePen URL like https://codepen.io/user/pen/hash",
      }));
    } else {
      setErrors((prev) => ({ ...prev, codepen_url: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: ValidationErrors = {};

    if (title.trim().length < 3 || title.trim().length > 120) {
      nextErrors.title = "Title must be 3-120 characters.";
    }
    if (!penId || !codepenUsername) {
      nextErrors.codepen_url = "Fetch a valid CodePen URL before submitting.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const data = await createSubmissionAction({
        id: penId!,
        title: title.trim(),
        codepen_username: codepenUsername!,
      });

      router.push(`/submission/${data.id}`);
      router.refresh();
    } catch (error) {
      setErrors({ form: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SubmissionCheck>
      <div className="container mx-auto px-6 sm:px-8 py-16 sm:py-20 max-w-4xl">
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 sm:mb-8">Submit Your Entry</h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Share your terrible UI creation with the world. The worse, the better.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
        <Card>
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl">Submission Details</CardTitle>
            <CardDescription className="text-base">
              Provide a title and CodePen URL for your terrible UI creation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-6"
              aria-label="Submission form"
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <FieldContent>
                    <Input
                      id="title"
                      name="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="My Terrible UI Widget"
                      aria-invalid={Boolean(errors.title)}
                      aria-describedby={errors.title ? "title-error" : undefined}
                      className="h-12"
                    />
                  </FieldContent>
                  <FieldError
                    id="title-error"
                    errors={errors.title ? [{ message: errors.title }] : []}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="codepen">CodePen URL</FieldLabel>
                  <FieldContent className="flex-col sm:flex-row gap-3">
                    <Input
                      id="codepen"
                      name="codepen"
                      value={codepenUrl}
                      onChange={(e) => {
                        setCodepenUrl(e.target.value);
                        setPenId(null);
                        setCodepenUsername(null);
                      }}
                      placeholder="https://codepen.io/username/pen/abc123"
                      inputMode="url"
                      aria-invalid={Boolean(errors.codepen_url)}
                      aria-describedby={
                        errors.codepen_url ? "codepen-error" : undefined
                      }
                      className="h-12"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleFetchPen}
                      disabled={!isValidCodepenUrl(codepenUrl)}
                      className="h-12 px-6 w-full sm:w-auto"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Fetch
                    </Button>
                  </FieldContent>
                  <FieldError
                    id="codepen-error"
                    errors={
                      errors.codepen_url ? [{ message: errors.codepen_url }] : []
                    }
                  />
                </Field>
              </FieldGroup>

              {errors.form ? (
                <div className="text-destructive text-sm p-4 bg-destructive/10 rounded-lg border border-destructive/20" role="alert">
                  {errors.form}
                </div>
              ) : null}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  aria-label="Go back"
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  aria-label="Create submission"
                  className="flex-1"
                >
                  {isSubmitting ? "Submitting..." : "Submit Entry"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {penId && codepenUsername && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Preview</CardTitle>
                <CardDescription>
                  This is how your submission will appear to others.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-0 overflow-hidden rounded-lg border pb-[56.25%]">
                  <iframe
                    className="absolute left-0 top-0 h-full w-full"
                    scrolling="no"
                    title="CodePen Embed"
                    src={createSafeCodepenEmbedUrl(codepenUsername, penId)}
                    frameBorder="no"
                    loading="lazy"
                    allowFullScreen={true}
                    onLoad={() => setIframeLoaded(true)}
                  >
                    See the Pen{" "}
                    <a
                      href={createSafeCodepenPenUrl(codepenUsername, penId)}
                    >
                      {title || "CodePen"}
                    </a>
                    .
                  </iframe>
                </div>
              </CardContent>
            </Card>
          )}

          {!iframeLoaded && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Submission Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p>Make it intentionally terrible - the worse, the better</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p>Use CodePen to create your terrible UI</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p>Be creative and have fun with it</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p>One submission per user</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    </SubmissionCheck>
  );
}
