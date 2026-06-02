/**
 * Deterministic avatar background colors for initials fallbacks.
 *
 * A user's color is derived from a stable key (preferably their id) so the same
 * person always gets the same color across every surface, with no data stored on
 * the backend. The palette keeps white text legible in both light and dark mode.
 */

const AVATAR_PALETTE = [
  "bg-rose-600",
  "bg-orange-600",
  "bg-amber-600",
  "bg-emerald-600",
  "bg-teal-600",
  "bg-cyan-700",
  "bg-sky-600",
  "bg-blue-600",
  "bg-indigo-600",
  "bg-violet-600",
  "bg-fuchsia-600",
  "bg-slate-600",
] as const;

const FALLBACK_COLOR = AVATAR_PALETTE[0];

/**
 * Returns a Tailwind `bg-*` class for the given key. Pass the user's id when
 * available; fall back to a name string otherwise. Empty/undefined keys get a
 * stable default so the avatar is never unstyled.
 */
export function getAvatarColor(key?: string | null): string {
  if (!key) return FALLBACK_COLOR;

  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}
