import { NextResponse } from "next/server";
import { runPipeline } from "@/features/common/ai-model/pipeline";

export async function POST(req: Request) {
  let message: unknown;
  try {
    ({ message } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json(
      { error: "`message` is required and must be a non-empty string" },
      { status: 400 },
    );
  }

  try {
    const result = await runPipeline(message);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
