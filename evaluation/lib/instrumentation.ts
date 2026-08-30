import { OpenRouter } from "@openrouter/sdk";
import { pathToFileURL } from "node:url";
import type { PipelineResult } from "../../src/features/common/ai-model/pipeline";

interface Recorder {
  externalCalls: number;
  pipelineStepCalls: number;
}

type AnyFn = (...args: unknown[]) => Promise<unknown>;

let activeRecorder: Recorder | null = null;
let sdkPatched = false;
const patchedGenerateCtors = new WeakSet<object>();

/**
 * Patches the OpenRouter SDK's Chat.send - the actual HTTP call boundary -
 * so we can count real external calls without touching any application
 * source. Both the baseline worktree and this checkout resolve
 * "@openrouter/sdk" to the same installed package, so one patch instruments
 * both implementations identically.
 */
function patchChatSendOnce(): void {
  if (sdkPatched) return;
  sdkPatched = true;

  const probe = new OpenRouter({ apiKey: "instrumentation-probe" });
  const chatInstance = probe.chat as unknown as { send: AnyFn };
  const ChatCtor = chatInstance.constructor as { prototype: { send: AnyFn } };
  const originalSend = ChatCtor.prototype.send;

  ChatCtor.prototype.send = function patchedSend(this: unknown, ...args: unknown[]) {
    if (activeRecorder) activeRecorder.externalCalls += 1;
    return originalSend.apply(this, args);
  };
}

/**
 * Patches a branch's ClaudeModel.generate() so we can count how many
 * logical pipeline steps were attempted. Comparing this against the raw
 * external-call count above reveals real retry activity: advanced's
 * generate() can cost more than one external call per step (see
 * withRetry in retry.ts); baseline's generate() never can, by construction.
 */
function patchClaudeModelGenerate(ClaudeModelCtor: { prototype: { generate: AnyFn } }): void {
  if (patchedGenerateCtors.has(ClaudeModelCtor.prototype)) return;
  patchedGenerateCtors.add(ClaudeModelCtor.prototype);

  const original = ClaudeModelCtor.prototype.generate;
  ClaudeModelCtor.prototype.generate = function patchedGenerate(this: unknown, ...args: unknown[]) {
    if (activeRecorder) activeRecorder.pipelineStepCalls += 1;
    return original.apply(this, args);
  };
}

export interface InstrumentedPipeline {
  runPipeline: (transcript: string) => Promise<PipelineResult>;
}

/**
 * Loads `runPipeline` from a given implementation root (this checkout, or
 * the baseline worktree) and installs call-counting instrumentation on its
 * ClaudeModel before any test case runs. Uses dynamic import over absolute
 * file paths so the same harness works for both an in-repo module and a
 * module living in a separate git worktree.
 */
export async function loadInstrumentedPipeline(
  pipelineFilePath: string,
  anthropicFilePath: string,
): Promise<InstrumentedPipeline> {
  patchChatSendOnce();

  const anthropicModule = (await import(pathToFileURL(anthropicFilePath).href)) as {
    ClaudeModel: { prototype: { generate: AnyFn } };
  };
  patchClaudeModelGenerate(anthropicModule.ClaudeModel);

  const pipelineModule = (await import(pathToFileURL(pipelineFilePath).href)) as InstrumentedPipeline;
  return pipelineModule;
}

/**
 * Starts attributing every external/pipeline-step call to a fresh recorder,
 * returned so the caller can read it after the run - whether it succeeded
 * or threw. Cases are run strictly sequentially (never concurrently), so a
 * single module-level "active recorder" is sufficient; no per-call context
 * threading needed. Always pair with `endRecording()` in a `finally`.
 */
export function beginRecording(): Recorder {
  const recorder: Recorder = { externalCalls: 0, pipelineStepCalls: 0 };
  activeRecorder = recorder;
  return recorder;
}

export function endRecording(): void {
  activeRecorder = null;
}
