type AccentColor = 'primary' | 'secondary' | 'tertiary' | 'warning'

interface Trend {
  value: string
  direction: 'up' | 'down' | 'neutral'
}

interface MetricCardProps {
  label: string
  value: string
  subtext?: string
  trend?: Trend
  accent?: AccentColor
}

const accentBorder: Record<AccentColor, string> = {
  primary:   'border-primary',
  secondary: 'border-secondary',
  tertiary:  'border-tertiary',
  warning:   'border-primary-container',
}

const trendIcon: Record<'up' | 'down' | 'neutral', string> = {
  up:      'trending_up',
  down:    'trending_down',
  neutral: 'trending_flat',
}

const trendColor: Record<'up' | 'down' | 'neutral', string> = {
  up:      'text-tertiary',
  down:    'text-error',
  neutral: 'text-secondary',
}

export default function MetricCard({
  label,
  value,
  subtext,
  trend,
  accent = 'primary',
}: MetricCardProps) {
  return (
    <div
      className={`bg-surface-container-lowest p-6 rounded-md shadow-sm border-l-4 ${accentBorder[accent]}`}
    >
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-secondary mb-1">
        {label}
      </p>
      <h3 className="text-2xl font-black text-on-surface">{value}</h3>

      {trend && (
        <div className={`flex items-center mt-2 text-[11px] font-bold ${trendColor[trend.direction]}`}>
          <span
            className="material-symbols-outlined text-[14px] mr-1"
            aria-hidden="true"
          >
            {trendIcon[trend.direction]}
          </span>
          <span>{trend.value}</span>
        </div>
      )}

      {subtext && !trend && (
        <p className="text-secondary text-[11px] font-bold mt-2">{subtext}</p>
      )}
    </div>
  )
}
