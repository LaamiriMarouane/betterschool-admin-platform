import { HTTP_CONFIG, STORAGE_KEYS, tokenStorage } from "@/lib/http";

function apiOrigin(): string | null {
  try {
    return new URL(HTTP_CONFIG.BASE_URL, window.location.origin).origin;
  } catch {
    return null;
  }
}

function toAbsolute(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${HTTP_CONFIG.BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

/**
 * Image loading for protected backend blobs. The platform console's images
 * (school logos, etc.) live behind authenticated endpoints, so a plain
 * `<img src>` would 401 — they must be fetched with the bearer token and turned
 * into an object URL. Mirrors the product app's imageService.
 */
export const imageService = {
  /**
   * True when the URL is a public/cross-origin asset (external or presigned) that
   * can be rendered directly. Relative or same-origin-as-the-API URLs are
   * protected backend blobs and must go through {@link loadImageWithAuth}.
   */
  isDirect(url: string): boolean {
    if (!/^https?:\/\//i.test(url)) return false;
    try {
      return new URL(url).origin !== apiOrigin();
    } catch {
      return false;
    }
  },

  /** Fetch a protected image with auth and return an object URL (caller revokes it), or null. */
  loadImageWithAuth: async (imageUrl: string): Promise<string | null> => {
    if (!imageUrl) return null;
    try {
      const headers: Record<string, string> = {};
      const token = tokenStorage.getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
      const language = localStorage.getItem(STORAGE_KEYS.language);
      if (language) headers["Accept-Language"] = language;

      const response = await fetch(toAbsolute(imageUrl), { headers });
      if (!response.ok) return null;
      return URL.createObjectURL(await response.blob());
    } catch {
      return null;
    }
  },
};
