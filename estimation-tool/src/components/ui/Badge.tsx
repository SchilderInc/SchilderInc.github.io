type BadgeVariant = 'primary' | 'secondary' | 'tertiary' | 'error' | 'neutral'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  primary:   'bg-primary-fixed text-on-primary-fixed',
  secondary: 'bg-secondary-fixed text-on-secondary-fixed',
  tertiary:  'bg-tertiary-fixed text-on-tertiary-fixed',
  error:     'bg-error-container text-on-error-container',
  neutral:   'bg-surface-container text-on-surface-variant',
}

export default function Badge({ label, variant = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${variantClasses[variant]} ${className}`}
    >
      {label}
    </span>
  )
}
