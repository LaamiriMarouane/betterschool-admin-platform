import * as React from "react";
import { Search } from "lucide-react";

import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import useRTL from "@/hooks/use-rtl";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  showIcon?: boolean;
  placeholder?: string;
  /** Called after `debounceMs` idle; input shows text immediately via internal draft. */
  onChange: (value: string) => void;
  wrapperClassName?: string;
  /**
   * Debounce delay (ms) before `onChange` runs. Set `0` to fire on every keystroke.
   * @default 400
   */
  debounceMs?: number;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      showIcon = true,
      placeholder,
      onChange,
      className,
      wrapperClassName,
      debounceMs = 400,
      value: valueProp,
      defaultValue,
      ...props
    },
    ref,
  ) => {
    const isRTL = useRTL();
    const [draft, setDraft] = React.useState<string>(() =>
      valueProp !== undefined && valueProp !== null
        ? String(valueProp)
        : defaultValue !== undefined && defaultValue !== null
          ? String(defaultValue)
          : "",
    );
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
      if (valueProp !== undefined && valueProp !== null) {
        setDraft(String(valueProp));
      }
    }, [valueProp]);

    React.useEffect(
      () => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      },
      [],
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      setDraft(next);
      if (debounceMs <= 0) {
        onChange(next);
        return;
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onChange(next), debounceMs);
    };

    return (
      <div className={cn("relative w-full", wrapperClassName)}>
        {showIcon && (
          <Search
            className={cn(
              "absolute top-1/2 transform -translate-y-1/2 h-4 w-4 z-10",
              "text-muted-foreground dark:text-muted-foreground/80",
              isRTL ? "right-4" : "left-4",
            )}
          />
        )}
        <Input
          ref={ref}
          type="text"
          placeholder={placeholder}
          value={draft}
          className={cn(
            "px-4 py-2.5",
            showIcon && (isRTL ? "pr-11" : "pl-11"),
            "bg-background dark:bg-card",
            "border border-input shadow-none",
            className,
          )}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
