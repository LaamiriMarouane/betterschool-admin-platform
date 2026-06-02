import { useState } from "react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { enUS, fr, ar, type Locale } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import type {
  SelectSingleEventHandler,
  SelectRangeEventHandler,
  DateRange,
  DayClickEventHandler,
  WeekNumberClickEventHandler,
} from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, type CalendarProps } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LOCALES: Record<string, Locale> = { en: enUS, fr, ar };

interface DatePickerSingleProps
  extends Omit<CalendarProps, "selected" | "onSelect" | "mode"> {
  mode?: "single";
  value?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  dateFormat?: string;
  buttonClassName?: string;
  buttonDisabled?: boolean;
  align?: "start" | "center" | "end";
}

interface DatePickerRangeProps
  extends Omit<CalendarProps, "selected" | "onSelect" | "mode"> {
  mode: "range";
  value?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  placeholder?: string;
  dateFormat?: string;
  buttonClassName?: string;
  buttonDisabled?: boolean;
  align?: "start" | "center" | "end";
}

interface DatePickerWeekProps
  extends Omit<CalendarProps, "selected" | "onSelect" | "mode"> {
  mode: "week";
  value?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  dateFormat?: string;
  buttonClassName?: string;
  buttonDisabled?: boolean;
  align?: "start" | "center" | "end";
}

interface DatePickerMonthProps
  extends Omit<CalendarProps, "selected" | "onSelect" | "mode"> {
  mode: "month";
  value?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  dateFormat?: string;
  buttonClassName?: string;
  buttonDisabled?: boolean;
  align?: "start" | "center" | "end";
}

type DatePickerProps =
  | DatePickerSingleProps
  | DatePickerRangeProps
  | DatePickerWeekProps
  | DatePickerMonthProps;

/**
 * DatePicker supporting single / range / week / month selection.
 * (Time selection was dropped from the ported version — add a TimePicker if needed.)
 */
export function DatePicker(props: DatePickerProps) {
  const { t, i18n } = useTranslation();
  const locale = LOCALES[i18n.language] ?? enUS;
  const [open, setOpen] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<Date | undefined>(undefined);
  const [monthPickerYear, setMonthPickerYear] = useState(() =>
    new Date().getFullYear(),
  );

  const defaultFromDate = new Date();
  defaultFromDate.setFullYear(defaultFromDate.getFullYear() - 100);
  const defaultToDate = new Date();
  defaultToDate.setFullYear(defaultToDate.getFullYear() + 100);

  // Single date mode
  if (props.mode === "single" || !props.mode) {
    const {
      value,
      onSelect,
      placeholder,
      dateFormat,
      buttonClassName,
      buttonDisabled = false,
      align = "start",
      ...calendarProps
    } = props as DatePickerSingleProps;

    const finalFormat = dateFormat || "PPP";
    const formatDate = (date: Date): string =>
      format(date, finalFormat, { locale });

    const handleSelect: SelectSingleEventHandler = (day) => {
      onSelect?.(day);
      setOpen(false);
    };

    const resolvedFromYear =
      (calendarProps as { fromYear?: number }).fromYear ??
      (calendarProps.fromDate ?? defaultFromDate).getFullYear();
    const resolvedToYear =
      (calendarProps as { toYear?: number }).toYear ??
      (calendarProps.toDate ?? defaultToDate).getFullYear();

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={buttonDisabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              buttonClassName,
            )}
            icon={<CalendarIcon />}
          >
            {value ? formatDate(value) : <span>{placeholder || t("datePicker.pickDate")}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[9999] w-auto p-0 pointer-events-auto"
          align={align}
          data-date-picker-popover
        >
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            fromDate={calendarProps.fromDate || defaultFromDate}
            toDate={calendarProps.toDate || defaultToDate}
            {...calendarProps}
            fromYear={resolvedFromYear}
            toYear={resolvedToYear}
          />
        </PopoverContent>
      </Popover>
    );
  }

  // Week selection mode
  if (props.mode === "week") {
    const {
      value,
      onSelect,
      placeholder,
      dateFormat,
      buttonClassName,
      buttonDisabled = false,
      align = "start",
      ...calendarProps
    } = props as DatePickerWeekProps;

    const finalFormat = dateFormat || "MMM dd";
    const formatDateWeek = (date: Date): string => {
      const start = startOfWeek(date, { weekStartsOn: 1 });
      const end = endOfWeek(date, { weekStartsOn: 1 });
      return `${format(start, finalFormat, { locale })} - ${format(end, "MMM dd, yyyy", { locale })}`;
    };

    const handleDayClick: DayClickEventHandler = (day) => {
      onSelect?.(startOfWeek(day, { weekStartsOn: 1 }));
      setOpen(false);
    };

    const handleWeekClick: WeekNumberClickEventHandler = (_weekNumber, days) => {
      if (onSelect && days.length > 0) {
        const middleDay = days[Math.floor(days.length / 2)];
        onSelect(startOfWeek(middleDay, { weekStartsOn: 1 }));
      }
      setOpen(false);
    };

    const getModifiers = () => {
      const modifiers: Record<string, unknown> = {};
      if (value) {
        modifiers.selected_range = {
          from: startOfWeek(value, { weekStartsOn: 1 }),
          to: endOfWeek(value, { weekStartsOn: 1 }),
        };
        modifiers.selected_range_start = startOfWeek(value, { weekStartsOn: 1 });
        modifiers.selected_range_end = endOfWeek(value, { weekStartsOn: 1 });
      }
      if (hoveredDate) {
        modifiers.hover_range = {
          from: startOfWeek(hoveredDate, { weekStartsOn: 1 }),
          to: endOfWeek(hoveredDate, { weekStartsOn: 1 }),
        };
        modifiers.hover_range_start = startOfWeek(hoveredDate, { weekStartsOn: 1 });
        modifiers.hover_range_end = endOfWeek(hoveredDate, { weekStartsOn: 1 });
      }
      return modifiers;
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={buttonDisabled}
            className={cn(
              "h-10 w-full justify-start px-3 py-2 text-start text-sm font-normal shadow-none",
              !value && "text-muted-foreground",
              buttonClassName,
            )}
            icon={<CalendarIcon className="opacity-50" />}
          >
            {value ? formatDateWeek(value) : <span>{placeholder || t("datePicker.pickWeek")}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[9999] w-auto p-0 pointer-events-auto"
          align={align}
          data-date-picker-popover
        >
          <Calendar
            {...calendarProps}
            mode="single"
            selected={value}
            onDayClick={handleDayClick}
            onWeekNumberClick={handleWeekClick}
            onDayMouseEnter={setHoveredDate}
            onDayMouseLeave={() => setHoveredDate(undefined)}
            modifiers={getModifiers() as unknown as CalendarProps["modifiers"]}
            fromDate={calendarProps.fromDate || defaultFromDate}
            toDate={calendarProps.toDate || defaultToDate}
            fromYear={calendarProps.fromYear || defaultFromDate.getFullYear()}
            toYear={calendarProps.toYear || defaultToDate.getFullYear()}
            showOutsideDays
            showWeekNumber
            captionLayout="dropdown-buttons"
          />
        </PopoverContent>
      </Popover>
    );
  }

  // Month selection mode
  if (props.mode === "month") {
    const {
      value,
      onSelect,
      placeholder,
      dateFormat,
      buttonClassName,
      buttonDisabled = false,
      align = "start",
      ...calendarProps
    } = props as DatePickerMonthProps;

    const finalFormat = dateFormat || "MMMM yyyy";
    const formatMonth = (date: Date): string =>
      format(date, finalFormat, { locale });

    const fromYear =
      calendarProps.fromDate?.getFullYear() ?? defaultFromDate.getFullYear();
    const toYear =
      calendarProps.toDate?.getFullYear() ?? defaultToDate.getFullYear();
    const years = Array.from(
      { length: toYear - fromYear + 1 },
      (_, i) => fromYear + i,
    );
    const year = monthPickerYear;

    const handleOpenChange = (next: boolean) => {
      if (next) setMonthPickerYear(value?.getFullYear() ?? new Date().getFullYear());
      setOpen(next);
    };

    const handleMonthClick = (monthIndex: number) => {
      onSelect?.(new Date(year, monthIndex, 1));
      setOpen(false);
    };

    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={buttonDisabled}
            className={cn(
              "h-9 w-full min-w-0 justify-center gap-2 text-center font-normal",
              !value && "text-muted-foreground",
              buttonClassName,
            )}
            icon={<CalendarIcon />}
          >
            {value ? formatMonth(value) : <span>{placeholder || t("datePicker.pickMonth")}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[9999] w-auto p-0 pointer-events-auto"
          align={align}
          data-date-picker-popover
        >
          <div className="space-y-4 px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
            <Select
              value={String(year)}
              onValueChange={(v) => setMonthPickerYear(Number(v))}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[10000]">
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-3 gap-x-2 gap-y-2 sm:gap-x-2.5 sm:gap-y-2.5">
              {Array.from({ length: 12 }, (_, i) => (
                <Button
                  key={i}
                  variant={
                    value &&
                    value.getFullYear() === year &&
                    value.getMonth() === i
                      ? "default"
                      : "ghost"
                  }
                  size="sm"
                  className="min-h-9 px-2 text-sm font-medium"
                  onClick={() => handleMonthClick(i)}
                >
                  {format(new Date(year, i, 1), "MMM", { locale })}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Range mode
  const {
    value,
    onSelect,
    placeholder,
    dateFormat,
    buttonClassName,
    buttonDisabled = false,
    align = "start",
    ...calendarProps
  } = props as DatePickerRangeProps;

  const finalFormat = dateFormat || "MMM dd, yyyy";

  const rangeResolvedFromYear =
    (calendarProps as { fromYear?: number }).fromYear ??
    (calendarProps.fromDate ?? defaultFromDate).getFullYear();
  const rangeResolvedToYear =
    (calendarProps as { toYear?: number }).toYear ??
    (calendarProps.toDate ?? defaultToDate).getFullYear();

  const formatDateRange = (range: DateRange): string => {
    if (range.from && range.to) {
      return `${format(range.from, "MMM dd", { locale })} - ${format(range.to, finalFormat, { locale })}`;
    }
    if (range.from) {
      return `${format(range.from, finalFormat, { locale })} - ...`;
    }
    return "";
  };

  const handleRangeSelect: SelectRangeEventHandler = (range) => {
    onSelect?.(range);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={buttonDisabled}
          className={cn(
            "h-10 w-full justify-between px-3 py-2 text-start text-sm font-normal shadow-none",
            !value?.from && !value?.to && "text-muted-foreground",
            buttonClassName,
          )}
          iconEnd={<CalendarIcon className="opacity-50" />}
        >
          {value?.from || value?.to ? (
            formatDateRange(value as DateRange)
          ) : (
            <span>{placeholder || t("datePicker.pickDateRange")}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[9999] w-auto p-0 pointer-events-auto"
        align={align}
        data-date-picker-popover
      >
        <Calendar
          mode="range"
          selected={value}
          onSelect={handleRangeSelect}
          fromDate={calendarProps.fromDate || defaultFromDate}
          toDate={calendarProps.toDate || defaultToDate}
          {...calendarProps}
          fromYear={rangeResolvedFromYear}
          toYear={rangeResolvedToYear}
        />
      </PopoverContent>
    </Popover>
  );
}
