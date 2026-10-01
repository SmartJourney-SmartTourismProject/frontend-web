/**
 * Looping empty-state art: a wallet with coins bobbing above it. Pure SVG +
 * the shared `animate-float` keyframes, so the global reduced-motion rule
 * freezes it with no extra code.
 */
export function EmptyIllustration({ className }: { className?: string }) {
  const coin = (cx: number, delay: string) => (
    <g key={cx} className="animate-float" style={{ animationDelay: delay }}>
      <circle cx={cx} cy={22} r={9} className="fill-amber-300 stroke-amber-500" strokeWidth={2} />
      <text
        x={cx}
        y={26}
        textAnchor="middle"
        className="fill-amber-700"
        style={{ fontSize: 11, fontWeight: 700 }}
      >
        $
      </text>
    </g>
  );

  return (
    <svg viewBox="0 0 120 100" className={className} role="img" aria-label="Empty wallet">
      {coin(40, '0s')}
      {coin(62, '0.6s')}
      {coin(84, '1.2s')}
      <rect x={16} y={44} width={88} height={48} rx={10} className="fill-brand-100 stroke-brand-500" strokeWidth={2.5} />
      <path d="M16 56h88" className="stroke-brand-500" strokeWidth={2.5} />
      <rect x={78} y={64} width={26} height={16} rx={5} className="fill-white stroke-brand-500" strokeWidth={2.5} />
      <circle cx={88} cy={72} r={2.5} className="fill-brand-500" />
    </svg>
  );
}
