import Image from 'next/image';

/**
 * SmartJourney's emblem (map pin, mountains and road). Cropped and downsized
 * from public/images/Purple Adventure Map Emblem.png into
 * public/images/logo.png. Decorative next to the "SmartJourney" wordmark,
 * hence the empty alt.
 */
export function Logo({ className = 'h-7 w-7' }: { className?: string }) {
  return <Image src="/images/logo.png" alt="" width={128} height={128} className={`shrink-0 ${className}`} />;
}
