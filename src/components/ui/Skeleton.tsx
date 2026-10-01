import clsx from 'clsx';

/** Shimmering placeholder block; size it with className. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={clsx('skeleton rounded-xl', className)} />;
}

/** A row of square card placeholders matching ListingCard's footprint. */
export function SkeletonCardRow({ count = 6 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden" role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="w-40 shrink-0">
          <Skeleton className="aspect-square w-40" />
          <Skeleton className="mt-2 h-3 w-28" />
        </div>
      ))}
    </div>
  );
}
