import { Dialog, DropdownMenu, Skeleton } from "@radix-ui/themes";
import { type ComponentProps, lazy, Suspense } from "react";

// Lazy load heavy Radix components to reduce initial bundle size
const LazyDialog = lazy(() =>
  import("@radix-ui/themes").then((module) => ({ default: module.Dialog })),
);

const LazyDropdownMenu = lazy(() =>
  import("@radix-ui/themes").then((module) => ({
    default: module.DropdownMenu,
  })),
);

// Loading fallbacks
const DialogSkeleton = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
    <Skeleton loading>
      <div className="bg-white rounded-lg p-6 w-96 h-48" />
    </Skeleton>
  </div>
);

const DropdownSkeleton = () => (
  <Skeleton loading>
    <div className="bg-white rounded border shadow-lg p-2 w-48 h-32" />
  </Skeleton>
);

// Wrapper components with suspense
export const LazyDialogWrapper = (
  props: ComponentProps<typeof Dialog.Root>,
) => (
  <Suspense fallback={<DialogSkeleton />}>
    <LazyDialog.Root {...props} />
  </Suspense>
);

export const LazyDropdownMenuWrapper = (
  props: ComponentProps<typeof DropdownMenu.Root>,
) => (
  <Suspense fallback={<DropdownSkeleton />}>
    <LazyDropdownMenu.Root {...props} />
  </Suspense>
);

// Re-export sub-components for convenience
export const LazyDialogContent = (
  props: ComponentProps<typeof Dialog.Content>,
) => (
  <Suspense fallback={<DialogSkeleton />}>
    <LazyDialog.Content {...props} />
  </Suspense>
);

export const LazyDialogTrigger = Dialog.Trigger;
export const LazyDialogTitle = Dialog.Title;
export const LazyDialogDescription = Dialog.Description;
export const LazyDialogClose = Dialog.Close;

export const LazyDropdownMenuTrigger = DropdownMenu.Trigger;
export const LazyDropdownMenuContent = (
  props: ComponentProps<typeof DropdownMenu.Content>,
) => (
  <Suspense fallback={<DropdownSkeleton />}>
    <LazyDropdownMenu.Content {...props} />
  </Suspense>
);
export const LazyDropdownMenuItem = DropdownMenu.Item;
export const LazyDropdownMenuSeparator = DropdownMenu.Separator;
export const LazyDropdownMenuLabel = DropdownMenu.Label;
export const LazyDropdownMenuCheckboxItem = DropdownMenu.CheckboxItem;
