'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const mobileItems = [
  { label: 'Dashboard', href: '/',                   icon: 'dashboard' },
  { label: 'Projects',  href: '/projects',           icon: 'architecture' },
  { label: 'Metrics',   href: '/scenario-analysis',  icon: 'query_stats' },
  { label: 'Settings',  href: '/settings',           icon: 'settings' },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 flex justify-around items-center h-16 px-4"
      aria-label="Mobile navigation"
    >
      {mobileItems.map(item => {
        const isActive =
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 ${
              isActive ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              aria-hidden="true"
            >
              {item.icon}
            </span>
            <span className="text-[9px] font-black uppercase">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
