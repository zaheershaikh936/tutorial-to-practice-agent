import type { PipelineResult } from "@/features/common/ai-model/pipeline";

const DB_NAME = "tutorial-to-practice-agent";
const DB_VERSION = 1;
const STORE_NAME = "pipeline-result";
const LATEST_KEY = "latest";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Overwrites the single stored record with `result` - always one key
 * (LATEST_KEY), so there is never more than the latest pipeline output.
 */
export async function saveLatestPipelineResult(result: PipelineResult): Promise<void> {
  if (typeof indexedDB === "undefined") return;

  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(result, LATEST_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export async function getLatestPipelineResult(): Promise<PipelineResult | null> {
  if (typeof indexedDB === "undefined") return null;

  const db = await openDb();
  try {
    return await new Promise<PipelineResult | null>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(LATEST_KEY);
      request.onsuccess = () => resolve((request.result as PipelineResult | undefined) ?? null);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}
