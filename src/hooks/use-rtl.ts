import { useEffect, useState } from "react";

/**
 * Tracks whether the document is in RTL mode by watching the `dir` attribute on
 * <html>. Set `document.documentElement.dir = "rtl"` (e.g. from a language
 * switch) and every consumer updates. No i18n dependency.
 */
function getIsRTL(): boolean {
  if (typeof document === "undefined") return false;
  return (
    document.documentElement.dir === "rtl" ||
    document.dir === "rtl"
  );
}

export default function useRTL(): boolean {
  const [isRTL, setIsRTL] = useState<boolean>(getIsRTL);

  useEffect(() => {
    const update = () => setIsRTL(getIsRTL());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
    });
    return () => observer.disconnect();
  }, []);

  return isRTL;
}
