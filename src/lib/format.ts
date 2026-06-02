/** Human-readable byte size (binary units): 0 B, 932 KB, 4.7 MB, … */
export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

/** Money: USD is symbol-prefixed ($79), other currencies are code-suffixed (799 MAD). */
export function formatMoney(
  amount: number | null | undefined,
  currency: "USD" | "MAD",
): string | null {
  if (amount == null) return null;
  const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(amount);
  return currency === "USD" ? `$${number}` : `${number} ${currency}`;
}

/** Coarse relative-time vs now: "today", "in 13d", "13d ago". */
export function formatRelativeToNow(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  const days = Math.round((target - Date.now()) / 86_400_000);
  if (days === 0) return "today";
  return days > 0 ? `in ${days}d` : `${Math.abs(days)}d ago`;
}
