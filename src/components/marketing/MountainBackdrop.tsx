export function MountainBackdrop({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eaf3ff" />
          <stop offset="45%" stopColor="#f7fbff" />
          <stop offset="100%" stopColor="#dfe9f5" />
        </linearGradient>
        <linearGradient id="range1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c3cfe6" />
          <stop offset="100%" stopColor="#aab8d6" />
        </linearGradient>
        <linearGradient id="range2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9aa9cc" />
          <stop offset="100%" stopColor="#7f8fb8" />
        </linearGradient>
        <linearGradient id="range3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7683ab" />
          <stop offset="100%" stopColor="#5c6890" />
        </linearGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#sky)" />
      <path d="M0,420 L220,300 420,410 640,270 860,400 1080,290 1300,400 1520,300 1740,400 1920,320 1920,1080 0,1080 Z" fill="url(#range1)" opacity="0.85" />
      <path d="M0,560 L260,440 500,540 760,420 1020,540 1280,430 1560,540 1920,460 1920,1080 0,1080 Z" fill="url(#range2)" opacity="0.9" />
      <path d="M0,700 L300,580 620,690 940,570 1260,690 1600,590 1920,680 1920,1080 0,1080 Z" fill="url(#range3)" />
    </svg>
  )
}
