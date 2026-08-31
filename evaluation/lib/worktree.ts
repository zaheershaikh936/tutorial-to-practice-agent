import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const BASELINE_BRANCH = "feat/baseline-pipeline";
const WORKTREE_DIRNAME = ".baseline-worktree";

function git(args: string[], cwd: string): string {
  return execFileSync("git", args, { cwd, encoding: "utf-8" }).trim();
}

function branchExists(repoRoot: string, branch: string): boolean {
  try {
    git(["rev-parse", "--verify", "--quiet", branch], repoRoot);
    return true;
  } catch {
    return false;
  }
}

/**
 * The baseline implementation lives on a separate branch, not in this
 * checkout. Rather than importing it via a mocked/rewritten copy, we check
 * it out into a disposable `git worktree` so the evaluation runs the actual
 * baseline source files, unmodified, side by side with the current branch.
 */
export function ensureBaselineWorktree(repoRoot: string): string {
  const worktreePath = path.join(repoRoot, "evaluation", WORKTREE_DIRNAME);
  const pipelineEntry = path.join(worktreePath, "src/features/common/ai-model/pipeline.ts");

  if (existsSync(pipelineEntry)) {
    return worktreePath;
  }

  const localBranchExists = branchExists(repoRoot, BASELINE_BRANCH);
  const ref = localBranchExists ? BASELINE_BRANCH : `origin/${BASELINE_BRANCH}`;
  if (!localBranchExists && !branchExists(repoRoot, ref)) {
    throw new Error(
      `Cannot find baseline branch "${BASELINE_BRANCH}" locally or as "${ref}". ` +
        `Fetch it first (e.g. "git fetch origin ${BASELINE_BRANCH}") and re-run.`,
    );
  }

  console.log(`Setting up baseline worktree from "${ref}" at ${path.relative(repoRoot, worktreePath)}/ ...`);

  if (existsSync(worktreePath)) {
    // Left over from an interrupted run without the pipeline file in place - remove and redo.
    git(["worktree", "remove", "--force", worktreePath], repoRoot);
  }

  if (localBranchExists) {
    git(["worktree", "add", worktreePath, BASELINE_BRANCH], repoRoot);
  } else {
    git(["worktree", "add", "--detach", worktreePath, ref], repoRoot);
  }

  return worktreePath;
}
