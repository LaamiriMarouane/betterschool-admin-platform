import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccountActions, useAccountLoading } from "@/store/account/account.store";

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { forgotPassword } = useAccountActions();
  const loading = useAccountLoading();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = await forgotPassword(email);
    if (ok) setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        {submitted ? (
          <>
            <CardHeader className="space-y-1">
              <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <MailCheck className="size-5" />
              </div>
              <CardTitle className="text-xl">{t("account.forgot.sentTitle")}</CardTitle>
              <CardDescription>{t("account.forgot.sentDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="size-4" />
                {t("account.backToLogin")}
              </Link>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">{t("account.forgot.title")}</CardTitle>
              <CardDescription>{t("account.forgot.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" required>
                    {t("account.email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    autoFocus
                    required
                  />
                </div>
                <Button type="submit" className="w-full" loading={loading.forgot} disabled={!email}>
                  {t("account.forgot.submit")}
                </Button>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-4" />
                  {t("account.backToLogin")}
                </Link>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

export default ForgotPasswordPage;
