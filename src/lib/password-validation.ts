/**
 * Password strength + validation, mirroring the main frontend (and the backend
 * StrongPasswordValidator regex). Single source of truth for the platform app.
 */

/** Min 8 chars, one lower, one upper, one digit, one special char. */
export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])[a-zA-Z\d\w\W]{8,}$/;

export function isStrongPassword(value: string | null | undefined): boolean {
  return STRONG_PASSWORD_REGEX.test(value ?? "");
}

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

export interface PasswordRequirement {
  met: boolean;
  /** i18n key under `password.req.*`. */
  labelKey: string;
}

const MIN_LENGTH = 8;

export function getPasswordRequirements(value: string | null | undefined): PasswordRequirement[] {
  const v = value ?? "";
  return [
    { met: v.length >= MIN_LENGTH, labelKey: "password.req.minLength" },
    { met: /[A-Z]/.test(v), labelKey: "password.req.uppercase" },
    { met: /[a-z]/.test(v), labelKey: "password.req.lowercase" },
    { met: /\d/.test(v), labelKey: "password.req.number" },
    { met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v), labelKey: "password.req.specialChar" },
  ];
}

export function getStrengthScore(value: string | null | undefined): number {
  return getPasswordRequirements(value).filter((req) => req.met).length;
}

export function getPasswordStrength(value: string | null | undefined): PasswordStrength {
  const met = getStrengthScore(value);
  if (met <= 1) return "weak";
  if (met === 2) return "fair";
  if (met <= 4) return "good";
  return "strong";
}
