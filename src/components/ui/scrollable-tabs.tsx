import { useEffect, useRef, type ReactNode } from "react";
import { useSearchParams } from "react-router";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useRTL from "@/hooks/use-rtl";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
  badge?: string | number;
  badgeClassName?: string;
}

interface ScrollableTabsProps {
  tabs: TabItem[];
  /** URL query param the active tab is synced to (deep-linkable). Defaults to "tab". */
  paramName?: string;
  defaultValue?: string;
  className?: string;
  tabsListClassName?: string;
  /** Override default wrapper styling on the strip. */
  stripWrapperClassName?: string;
  /** Merged with the tab strip scroll row (default includes `mt-2`). */
  stripScrollClassName?: string;
  /** Applied to every `TabsContent` panel (e.g. `pt-3` below the strip). */
  tabsContentClassName?: string;
}

/**
 * Horizontally-scrollable tabs whose active tab is stored in the URL (`?tab=`),
 * so it's deep-linkable and survives refresh — mirrors the product app.
 */
export const ScrollableTabs = ({
  tabs,
  paramName = "tab",
  defaultValue,
  className,
  tabsListClassName,
  stripWrapperClassName,
  stripScrollClassName,
  tabsContentClassName,
}: ScrollableTabsProps) => {
  const activeTabRef = useRef<HTMLButtonElement | null>(null);
  const isRTL = useRTL();
  const [searchParams, setSearchParams] = useSearchParams();

  const effectiveDefaultValue = defaultValue || tabs[0]?.value;
  const activeTab = searchParams.get(paramName) || effectiveDefaultValue;

  useEffect(() => {
    // If the URL points at an unknown tab, reset it to the default.
    const isValidTab = tabs.some((tab) => tab.value === activeTab);
    if (!isValidTab && tabs.length > 0 && effectiveDefaultValue) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set(paramName, effectiveDefaultValue);
      setSearchParams(newParams, { replace: true });
      return;
    }

    // Keep the active trigger scrolled into view (incl. on resize).
    const scrollActiveIntoView = () => {
      activeTabRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    };
    scrollActiveIntoView();
    window.addEventListener("resize", scrollActiveIntoView);
    return () => window.removeEventListener("resize", scrollActiveIntoView);
  }, [activeTab, tabs, paramName, effectiveDefaultValue, setSearchParams, searchParams]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set(paramName, value);
        setSearchParams(newParams);
      }}
      className={cn("w-full", className)}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className={cn(" w-full", stripWrapperClassName)}>
        <div
          className={cn(
            "scrollbar-hide mt-2 flex-1 overflow-x-auto border-b border-border",
            stripScrollClassName,
          )}
        >
          <TabsList
            className={cn(
              "flex h-auto justify-start gap-0 bg-transparent p-0",
              tabsListClassName,
            )}
          >
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                disabled={tab.disabled}
                ref={activeTab === tab.value ? activeTabRef : null}
                className="flex-shrink-0 gap-2 whitespace-nowrap px-4 py-3 transition-all before:h-[2px] before:rounded-sm"
              >
                {tab.label}
                {tab.badge !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground",
                      tab.badgeClassName,
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className={cn("mt-0 focus-visible:outline-none ", tabsContentClassName)}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};
