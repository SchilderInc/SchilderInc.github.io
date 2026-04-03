type ColorVariant = 'primary' | 'secondary' | 'tertiary'

interface ProgressBarProps {
  /** Value 0–100 */
  value: number
  color?: ColorVariant
  ariaLabel: string
  className?: string
}

const trackClass = 'w-full h-1.5 rounded-full overflow-hidden bg-surface-container-high'

const fillClasses: Record<ColorVariant, string> = {
  primary:   'bg-primary',
  secondary: 'bg-secondary',
  tertiary:  'bg-tertiary',
}

export default function ProgressBar({
  value,
  color = 'secondary',
  ariaLabel,
  className = '',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={`${trackClass} ${className}`}
    >
      <div
        className={`h-full transition-all duration-300 ${fillClasses[color]}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
