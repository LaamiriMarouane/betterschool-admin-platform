import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { ApiError } from "@/lib/http";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { cn } from "@/lib/utils";

interface FormErrorFeedbackProps {
  /** An `ApiError` from a store, or a plain message string. */
  error?: ApiError | string | null;
  overrideTitle?: string;
  overrideDescription?: string;
  /** Render fixed at the bottom-center of the screen instead of inline. */
  floating?: boolean;
}

/**
 * Surfaces a store/form error as an alert. For backend VALIDATION_ERROR responses
 * (with `body.fields`) it lists the per-field messages; otherwise it shows the message.
 */
const FormErrorFeedback = ({
  error,
  overrideTitle,
  overrideDescription,
  floating,
}: FormErrorFeedbackProps) => {
  const { t } = useTranslation();
  const isApi = error instanceof ApiError;
  const message =
    overrideDescription ??
    (typeof error === "string" ? error : isApi ? error.message : null);
  const fields =
    isApi && error.code === "VALIDATION_ERROR"
      ? (error.body?.fields as Record<string, string> | undefined)
      : undefined;

  if (!message && !(fields && Object.keys(fields).length > 0)) return null;

  const renderAlert = (content: ReactNode, title?: string) => {
    const alert = (
      <Alert
        variant="destructive"
        className={cn(floating ? "m-0 backdrop-blur-sm" : "mb-4")}
      >
        {title && <AlertTitle>⚠️ {title}</AlertTitle>}
        <AlertDescription>{content}</AlertDescription>
      </Alert>
    );

    if (!floating) return alert;

    return (
      <div className="fixed bottom-10 inset-x-6 z-[60] flex justify-center pointer-events-none">
        <div className="pointer-events-auto max-w-2xl w-full animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-lg overflow-hidden">
            {alert}
          </div>
        </div>
      </div>
    );
  };

  if (fields && Object.keys(fields).length > 0) {
    return renderAlert(
      <ul className="list-disc ps-4 space-y-1">
        {Object.entries(fields).map(([field, fieldMessage]) => (
          <li key={field}>
            <span className="font-medium">{field}</span>: {fieldMessage}
          </li>
        ))}
      </ul>,
      overrideTitle || t("form.validationError"),
    );
  }

  return renderAlert(message);
};

export default FormErrorFeedback;
