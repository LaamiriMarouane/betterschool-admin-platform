import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "relative inline-flex w-full items-center justify-start gap-0 p-0 text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative mx-2 inline-flex items-center  border-muted  justify-center whitespace-nowrap px-2 py-3 text-base font-medium transition-all duration-300 ease-in-out first-of-type:ml-0 disabled:pointer-events-none disabled:text-muted-foreground data-[state=active]:font-semibold data-[state=active]:text-foreground",
      "before:absolute before:left-0 before:bottom-0 before:w-full before:h-[3px] before:bg-primary before:transition-all before:duration-300 before:ease-in-out",
      "data-[state=active]:before:scale-x-100 data-[state=inactive]:before:scale-x-0",
      "data-[state=active]:before:origin-left data-[state=inactive]:before:origin-right",
      "before:rounded-full hover:text-primary",
      "before:z-10",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2  ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
