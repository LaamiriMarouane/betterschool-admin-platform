export function extractFilenameFromContentDisposition(
  contentDisposition: string | null | undefined,
  fallbackFilename: string,
): string {
  if (!contentDisposition) return fallbackFilename;

  const encodedMatch = contentDisposition.match(/filename\*=\s*UTF-8''([^;]+)/i);
  if (encodedMatch?.[1]) {
    try {
      return decodeURIComponent(encodedMatch[1].trim());
    } catch {
      // fall through
    }
  }

  const quotedMatch = contentDisposition.match(/filename="([^"]+)"/i);
  if (quotedMatch?.[1]) return quotedMatch[1];

  const unquotedMatch = contentDisposition.match(/filename=([^;]+)/i);
  if (unquotedMatch?.[1]) return unquotedMatch[1].trim();

  return fallbackFilename;
}

/** Trigger a browser download from a cross-origin signed URL (e.g. Paddle invoice PDF). */
export function triggerSignedUrlDownload(url: string): void {
  if (!url?.trim()) {
    throw new Error("Missing download URL");
  }

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url;
  iframe.title = "download";
  document.body.appendChild(iframe);
  window.setTimeout(() => iframe.remove(), 60_000);
}

/** Trigger a file save in the browser without opening a new tab. */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  if (blob.size === 0) {
    throw new Error("Download returned an empty file");
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.trim() || "download";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
