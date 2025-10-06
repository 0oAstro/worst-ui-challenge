"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

type ValidationErrors = {
  title?: string;
  codepen_url?: string;
  form?: string;
};

const extractCodepenPenId = (value: string): string | null => {
  try {
    const url = new URL(value);
    if (!/(^|\.)codepen\.io$/i.test(url.hostname)) return null;
    const path = url.pathname.replace(/\/+$/, "");
    const parts = path.split("/").filter(Boolean);
    if (parts.length === 0) return null;
    if (parts[0].toLowerCase() === "pen" && parts[1]) return parts[1];
    if (
      parts.length >= 3 &&
      ["pen", "full", "embed"].includes(parts[1].toLowerCase())
    )
      return parts[2] || null;
    return null;
  } catch {
    return null;
  }
};

const isValidCodepenUrl = (value: string): boolean =>
  Boolean(extractCodepenPenId(value));

export default function NewSubmissionPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [codepenUrl, setCodepenUrl] = useState("");
  const [penId, setPenId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const canSubmit = useMemo(() => {
    if (title.trim().length < 3 || title.trim().length > 120) return false;
    if (!penId) return false;
    return true;
  }, [title, penId]);

  const handleFetchPen = () => {
    const id = extractCodepenPenId(codepenUrl);
    setPenId(id);
    if (!id) {
      setErrors((prev) => ({
        ...prev,
        codepen_url: "Enter a valid CodePen URL like https://codepen.io/user/pen/hash",
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
    if (!penId) {
      nextErrors.codepen_url = "Fetch a valid CodePen URL before submitting.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user?.id) {
        setErrors({ form: "You must be signed in to submit." });
        setIsSubmitting(false);
        return;
      }

      const userId = sessionData.session.user.id;

      const { data, error } = await supabase
        .from("submissions")
        .insert({ id: penId, user_id: userId, title: title.trim() })
        .select("id")
        .single();

      if (error) {
        setErrors({ form: error.message ?? "Failed to create submission." });
        setIsSubmitting(false);
        return;
      }

      router.push(`/submission/${data.id}`);
      router.refresh();
    } catch (err) {
      setErrors({ form: "Unexpected error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Submit your entry</CardTitle>
          <CardDescription>Provide a title and a CodePen URL.</CardDescription>
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
                    placeholder="Worst UI widget title"
                    aria-invalid={Boolean(errors.title)}
                    aria-describedby={errors.title ? "title-error" : undefined}
                  />
                </FieldContent>
                <FieldError
                  id="title-error"
                  errors={errors.title ? [{ message: errors.title }] : []}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="codepen">CodePen URL</FieldLabel>
                <FieldContent className="flex-row gap-2">
                  <Input
                    id="codepen"
                    name="codepen"
                    value={codepenUrl}
                    onChange={(e) => {
                      setCodepenUrl(e.target.value);
                      setPenId(null);
                    }}
                    placeholder="https://codepen.io/user/pen/abc123"
                    inputMode="url"
                    aria-invalid={Boolean(errors.codepen_url)}
                    aria-describedby={
                      errors.codepen_url ? "codepen-error" : undefined
                    }
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleFetchPen}
                    disabled={!isValidCodepenUrl(codepenUrl)}
                  >
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

            {penId && (
              <div className="rounded-md border">
                <iframe
                  height="300"
                  style={{ width: "100%" }}
                  scrolling="no"
                  title="CodePen Embed"
                  src={`https://codepen.io/team/codepen/embed/${penId}?default-tab=result`}
                  frameBorder="no"
                  loading="lazy"
                  allowFullScreen={true}
                >
                  See the Pen{" "}
                  <a href={`https://codepen.io/pen/${penId}`}>
                    {title || "CodePen"}
                  </a>
                  .
                </iframe>
              </div>
            )}

            {errors.form ? (
              <div className="text-destructive text-sm" role="alert">
                {errors.form}
              </div>
            ) : null}

            <FieldSeparator />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                aria-label="Go back"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                aria-label="Create submission"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


