import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import useRTL from "@/hooks/use-rtl";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface SearchableSelectOption {
  value: string;
  /** Shown in the closed trigger when this option is selected */
  label: string;
  /** If set, used for cmdk filtering; defaults to `value` + space + `label` */
  searchText?: string;
}

export interface SearchableSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  /** Popover panel width (Tailwind classes) */
  contentClassName?: string;
  /** Scroll area height in px */
  listHeightPx?: number;
  /** Applied to the trigger label when a value is selected */
  selectedLabelClassName?: string;
  /** Custom row in the dropdown. Default: single-line label + check when selected. */
  renderOption?: (
    option: SearchableSelectOption,
    ctx: { selected: boolean },
  ) => React.ReactNode;
  /**
   * When true, the filter does case-insensitive substring matching against each
   * option's {@link SearchableSelectOption.searchText} (or its label) instead of
   * cmdk's fuzzy default — use for codes (e.g. "3D", "ENG") that fuzzy-match too loosely.
   */
  strictSubstring?: boolean;
}

const SearchableSelect = React.forwardRef<
  HTMLButtonElement,
  SearchableSelectProps
>(
  (
    {
      value,
      onChange,
      options,
      placeholder,
      searchPlaceholder,
      emptyMessage,
      disabled,
      className,
      contentClassName,
      listHeightPx = 240,
      selectedLabelClassName,
      renderOption,
      strictSubstring,
    },
    ref,
  ) => {
    const isRTL = useRTL();
    const [open, setOpen] = React.useState(false);

    const selected = React.useMemo(
      () => options.find((o) => o.value === value),
      [options, value],
    );

    const handleSelect = React.useCallback(
      (next: string) => {
        onChange?.(next);
        setOpen(false);
      },
      [onChange],
    );

    const defaultRenderOption = React.useCallback(
      (option: SearchableSelectOption, ctx: { selected: boolean }) => (
        <>
          <span className="flex-1 truncate text-start">{option.label}</span>
          {ctx.selected && <Check className="h-4 w-4 text-primary shrink-0" />}
        </>
      ),
      [],
    );

    const rowRenderer = renderOption ?? defaultRenderOption;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-transparent",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-[border-color,box-shadow] duration-150",
              isRTL && "flex-row-reverse",
              className,
            )}
          >
            {value ? (
              <span className={cn("truncate text-start", selectedLabelClassName)}>
                {selected?.label ?? value}
              </span>
            ) : (
              <span className="text-muted-foreground truncate text-start">
                {placeholder}
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className={cn(
            "w-[var(--radix-popover-trigger-width)] min-w-[240px] max-w-[calc(100vw-2rem)] p-0",
            contentClassName,
          )}
          align="start"
        >
          <Command
            filter={
              strictSubstring
                ? (value: string, search: string) => {
                    if (!search) return 1;
                    return value.toLowerCase().includes(search.toLowerCase())
                      ? 1
                      : 0;
                  }
                : undefined
            }
          >
            <CommandInput
              placeholder={searchPlaceholder}
              className="border-0 focus:ring-0"
            />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                <ScrollArea style={{ height: listHeightPx }}>
                  {options.map((option) => {
                    const isSelected = value === option.value;
                    const filterValue =
                      option.searchText ?? `${option.value} ${option.label}`;
                    return (
                      <CommandItem
                        key={option.value}
                        value={filterValue}
                        onSelect={() => handleSelect(option.value)}
                        className={cn(
                          "flex items-center gap-2 text-start",
                          isRTL && "flex-row-reverse",
                        )}
                      >
                        {rowRenderer(option, { selected: isSelected })}
                      </CommandItem>
                    );
                  })}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

SearchableSelect.displayName = "SearchableSelect";

export { SearchableSelect };
