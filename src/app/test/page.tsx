"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PipelineResult {
  concept: {
    core_concept: string;
    prerequisites: string[];
    language: string;
    difficulty: string;
    multiple_concepts_flag: boolean;
    multiple_concepts_note: string;
  };
  exercise: {
    title: string;
    problem_statement: string;
    starter_code: string;
    hint: string;
    concept_tested: string;
  };
  testCases: {
    test_code: string;
    test_case_notes: { case: string; checks: string }[];
  };
  verification: {
    solution_code: string;
    test_results: { case: string; pass: boolean }[];
    all_passed: boolean;
    concept_bypassable: boolean;
    notes: string;
  };
}

export default function TestPage() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PipelineResult | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: transcript }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setResult(data as PipelineResult);
    } catch {
      setError("Failed to reach the API");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold">Pipeline Test</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Paste a tutorial transcript or blog post below and run it through the
          4-step pipeline: concept extraction → exercise generation → test
          cases → self-verification.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="transcript">Tutorial transcript</Label>
        <Textarea
          id="transcript"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste a tutorial transcript or blog post..."
          rows={12}
        />
      </div>

      <Button onClick={handleSubmit} disabled={loading || !transcript.trim()}>
        {loading ? "Running pipeline..." : "Run Pipeline"}
      </Button>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive text-sm">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{error}</CardContent>
        </Card>
      )}

      {result && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Step 1 — Concept Extraction</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto whitespace-pre-wrap text-sm">
                {JSON.stringify(result.concept, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 2 — Exercise Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto whitespace-pre-wrap text-sm">
                {JSON.stringify(result.exercise, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 3 — Test Case Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto whitespace-pre-wrap text-sm">
                {JSON.stringify(result.testCases, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 4 — Self-Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto whitespace-pre-wrap text-sm">
                {JSON.stringify(result.verification, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
