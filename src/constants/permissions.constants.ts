/**
 * Platform permission catalog for the Team UI. The keys mirror the backend
 * `platform.*` permissions (PermissionsHolder); the backend validates anything
 * submitted, so this list is for display/presets only. Labels are translated.
 */
export const PLATFORM_PERMISSIONS = [
  "platform.schools.read",
  "platform.schools.manage",
  "platform.stats.read",
  "platform.support.read",
  "platform.support.manage",
  "platform.billing.read",
  "platform.billing.manage",
  "platform.features.manage",
  "platform.users.read",
  "platform.users.manage",
  "platform.contact.read",
  "platform.contact.manage",
] as const;

export type PlatformPermission = (typeof PLATFORM_PERMISSIONS)[number];

/** i18n label key for a permission key. */
export const PERMISSION_LABEL_KEY: Record<PlatformPermission, string> = {
  "platform.schools.read": "permissions.labels.schoolsRead",
  "platform.schools.manage": "permissions.labels.schoolsManage",
  "platform.stats.read": "permissions.labels.statsRead",
  "platform.support.read": "permissions.labels.supportRead",
  "platform.support.manage": "permissions.labels.supportManage",
  "platform.billing.read": "permissions.labels.billingRead",
  "platform.billing.manage": "permissions.labels.billingManage",
  "platform.features.manage": "permissions.labels.featuresManage",
  "platform.users.read": "permissions.labels.usersRead",
  "platform.users.manage": "permissions.labels.usersManage",
  "platform.contact.read": "permissions.labels.contactRead",
  "platform.contact.manage": "permissions.labels.contactManage",
};

/** Map a permission's segment (platform.<segment>.<action>) to a display group. */
const SEGMENT_TO_GROUP: Record<string, string> = {
  schools: "schools",
  billing: "billing",
  contact: "contact",
  support: "support",
  users: "team",
  stats: "platform",
  features: "platform",
};

/** Preferred render order for groups; unknown groups fall to the end. */
export const GROUP_ORDER = ["schools", "billing", "contact", "support", "team", "platform"];

/** Display group for a permission key — derived, so new backend keys still slot in. */
export function permissionGroupKey(key: string): string {
  const segment = key.split(".")[1] ?? "";
  return SEGMENT_TO_GROUP[segment] ?? segment ?? "other";
}

/** Readable fallback for a permission/group with no translation (e.g. a new backend key). */
export function humanizePermission(key: string): string {
  const rest = key.replace(/^platform\./, "").replace(/[._]/g, " ").trim();
  return rest ? rest.charAt(0).toUpperCase() + rest.slice(1) : key;
}

/**
 * Every staff member always keeps these so they can at least load the console
 * (the picker renders them on + locked). Presets union with this floor.
 */
export const FLOOR_PERMISSIONS: PlatformPermission[] = ["platform.schools.read", "platform.stats.read"];

export const PRESETS = ["SUPER_ADMIN", "SUPPORT", "OPS", "BILLING"] as const;
export type PresetKey = (typeof PRESETS)[number];

export const PRESET_PERMISSIONS: Record<PresetKey, PlatformPermission[]> = {
  SUPER_ADMIN: [...PLATFORM_PERMISSIONS],
  SUPPORT: [
    "platform.schools.read",
    "platform.stats.read",
    "platform.contact.read",
    "platform.contact.manage",
    "platform.support.read",
    "platform.support.manage",
  ],
  OPS: ["platform.schools.read", "platform.stats.read", "platform.schools.manage", "platform.features.manage"],
  BILLING: ["platform.schools.read", "platform.stats.read", "platform.billing.read", "platform.billing.manage"],
};

const keySignature = (keys: readonly string[]) => [...keys].sort().join(",");

/** Identify which preset a permission set corresponds to (for display), else "CUSTOM". */
export function matchPreset(keys: string[]): PresetKey | "CUSTOM" {
  const target = keySignature(keys);
  for (const preset of PRESETS) {
    if (keySignature(PRESET_PERMISSIONS[preset]) === target) return preset;
  }
  return "CUSTOM";
}
