import { useCallback, useState } from "react";

import { notifyApiError } from "@/lib/notify";

/**
 * Loading + error toast wrapper for async download actions (signed URL or blob).
 */
export function useBlobDownload() {
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const run = useCallback(async (key: string, task: () => Promise<void>) => {
    setDownloadingKey(key);
    try {
      await task();
    } catch (err) {
      notifyApiError(err);
    } finally {
      setDownloadingKey(null);
    }
  }, []);

  return { downloadingKey, run };
}
