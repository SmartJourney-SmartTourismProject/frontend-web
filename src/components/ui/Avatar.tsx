import { initials } from '@/lib/initials';

/** Profile picture when there is one, otherwise the user's initials on the brand gradient. */
export function Avatar({
  src,
  name,
  className = 'h-8 w-8 text-xs',
}: {
  src?: string | null;
  name?: string | null;
  className?: string;
}) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element -- inline data URL, nothing for next/image to optimise
    <img src={src} alt="" className={`shrink-0 rounded-full object-cover ${className}`} />
  ) : (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand-gradient font-semibold text-white ${className}`}
    >
      {initials(name)}
    </span>
  );
}
