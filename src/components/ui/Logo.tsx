import { Plane } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm',
        className
      )}
    >
      <Plane className="rotate-45" strokeWidth={2.25} />
    </div>
  )
}

export function LogoWordmark({
  className,
  markClassName,
  textClassName,
}: {
  className?: string
  markClassName?: string
  textClassName?: string
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark className={cn('h-9 w-9', markClassName)} />
      <span className={cn('font-display text-xl font-semibold tracking-tight', textClassName)}>
        SmartJourney
      </span>
    </div>
  )
}
