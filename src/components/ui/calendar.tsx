import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, useDayPicker, useNavigation } from "react-day-picker";
import { format } from "date-fns";
import { enUS, fr, ar, type Locale } from "date-fns/locale";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./select";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  hoverRange?: { from: Date; to: Date };
};

const LOCALES: Record<string, Locale> = { en: enUS, fr, ar };

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  weekStartsOn = 1,
  ...props
}: CalendarProps) {
  const { i18n } = useTranslation();
  const locale = LOCALES[i18n.language] ?? enUS;
  return (
    <DayPicker
      locale={locale}
      showOutsideDays={showOutsideDays}
      weekStartsOn={weekStartsOn}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium hidden",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        caption_dropdowns: "flex gap-1",
        weeknumber:
          "flex h-9 w-9 items-center justify-center text-xs font-medium text-muted-foreground/50 hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer transition-colors",
        ...classNames,
      }}
      modifiersClassNames={{
        selected_range: "bg-primary/20 text-primary-foreground rounded-none",
        selected_range_start: "rounded-l-md bg-primary text-primary-foreground",
        selected_range_end: "rounded-r-md bg-primary text-primary-foreground",
        hover_range: "bg-accent/50 rounded-none",
        hover_range_start: "rounded-l-md",
        hover_range_end: "rounded-r-md",
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
        Dropdown: (dropdownProps) => {
          const { currentMonth, goToMonth } = useNavigation();
          const { fromYear, fromMonth, fromDate, toYear, toMonth, toDate } =
            useDayPicker();

          let selectValues: { value: string; label: string }[] = [];

          if (dropdownProps.name === "months") {
            selectValues = Array.from({ length: 12 }, (_, i) => {
              const monthDate = new Date(new Date().getFullYear(), i, 1);
              return {
                value: i.toString(),
                label: format(monthDate, "MMM", { locale }),
              };
            });
          } else if (dropdownProps.name === "years") {
            const earliestYear =
              fromYear || fromMonth?.getFullYear() || fromDate?.getFullYear();
            const latestYear =
              toYear || toMonth?.getFullYear() || toDate?.getFullYear();

            if (earliestYear && latestYear) {
              const yearsLength = latestYear - earliestYear + 1;

              selectValues = Array.from({ length: yearsLength }, (_, i) => {
                return {
                  value: (earliestYear + i).toString(),
                  label: (earliestYear + i).toString(),
                };
              });
            }
          }

          const caption =
            dropdownProps.name === "months"
              ? format(currentMonth, "MMM", { locale })
              : format(currentMonth, "yyyy", { locale });

          return (
            <Select
              onValueChange={(newValue) => {
                if (dropdownProps.name === "months") {
                  const newDate = new Date(currentMonth);
                  newDate.setMonth(parseInt(newValue));
                  goToMonth(newDate);
                } else if (dropdownProps.name === "years") {
                  const newDate = new Date(currentMonth);
                  newDate.setFullYear(parseInt(newValue));
                  goToMonth(newDate);
                }
              }}
              value={dropdownProps.value?.toString()}
            >
              <SelectTrigger>{caption}</SelectTrigger>
              <SelectContent className="z-[10000]">
                {selectValues.map((selectValue) => (
                  <SelectItem key={selectValue.value} value={selectValue.value}>
                    {selectValue.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
