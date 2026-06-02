import "@tanstack/react-table";

/**
 * Column `meta` augmentation consumed by the shared DataTable: `align` controls
 * cell/header alignment, `hideOnMobile` hides a column on small screens.
 */
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends unknown, TValue> {
    align?: "left" | "center" | "right";
    hideOnMobile?: boolean;
  }
}
