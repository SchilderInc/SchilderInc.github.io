'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Projects', href: '/projects' },
  { label: 'Docs',     href: '/docs' },
  { label: 'Support',  href: '/support' },
]

interface TopNavProps {
  userDisplayName?: string
  userInitials?: string
}

export default function TopNav({ userDisplayName, userInitials }: TopNavProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md h-16 w-full flex justify-between items-center px-8 border-b border-outline-variant/30">
      {/* Left: title + tabs */}
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-black text-on-surface tracking-tighter uppercase">
          Architectural Monolith
        </h1>

        <nav className="hidden lg:flex items-center gap-6" aria-label="Secondary navigation">
          {tabs.map(tab => {
            const isActive = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                className={`py-5 uppercase tracking-wider font-bold text-[10px] border-b-2 transition-colors ${
                  isActive
                    ? 'text-primary border-primary'
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="View notifications"
          className="p-2 text-on-surface-variant hover:bg-primary-fixed rounded-full transition-colors"
        >
          <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
        </button>

        <button
          type="button"
          aria-label="Help and documentation"
          className="p-2 text-on-surface-variant hover:bg-primary-fixed rounded-full transition-colors"
        >
          <span className="material-symbols-outlined" aria-hidden="true">help_outline</span>
        </button>

        <div className="h-8 w-px bg-outline-variant" aria-hidden="true" />

        <button
          type="button"
          className="px-5 py-2 bg-on-surface text-surface text-[11px] font-black uppercase tracking-widest rounded-md hover:opacity-80 transition-opacity active:scale-95"
        >
          Deploy
        </button>

        {/* User avatar */}
        <button
          type="button"
          aria-label={userDisplayName ? `User menu — ${userDisplayName}` : 'User menu'}
          className="w-8 h-8 rounded-full border-2 border-surface-container-lowest shadow-sm bg-secondary flex items-center justify-center text-on-secondary text-xs font-bold"
        >
          {userInitials ?? (
            <span className="material-symbols-outlined text-sm" aria-hidden="true">person</span>
          )}
        </button>
      </div>
    </header>
  )
}
