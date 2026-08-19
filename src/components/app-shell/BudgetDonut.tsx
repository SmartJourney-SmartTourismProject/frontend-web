const COLORS = ['#3a1257', '#c64d9e', '#9868bb', '#e56dab']

export function BudgetDonut({ segments }: { segments: { label: string; value: number }[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1
  let cursor = 0
  const stops = segments.map((s, i) => {
    const start = (cursor / total) * 360
    cursor += s.value
    const end = (cursor / total) * 360
    return `${COLORS[i % COLORS.length]} ${start}deg ${end}deg`
  })

  return (
    <div className="flex items-center gap-6">
      <div
        className="relative h-28 w-28 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops.join(', ')})` }}
      >
        <div className="absolute inset-2.5 flex flex-col items-center justify-center rounded-full bg-white text-center">
          <span className="text-base font-bold text-gray-900">{total.toLocaleString()}</span>
          <span className="text-[10px] text-gray-400">LKR spent</span>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {segments.map((s, i) => (
          <li key={s.label} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 text-gray-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              {s.label}
            </span>
            <span className="font-semibold text-gray-800">
              {total ? Math.round((s.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
