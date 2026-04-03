'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  icon: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard',        href: '/',                   icon: 'dashboard' },
  { label: 'Projects',         href: '/projects',           icon: 'architecture' },
  { label: 'Resource Planning', href: '/resource-planning', icon: 'analytics' },
  { label: 'Scenario Analysis', href: '/scenario-analysis', icon: 'query_stats' },
  { label: 'Settings',         href: '/settings',           icon: 'settings' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-slate-950 py-6 px-0 fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 signature-gradient rounded-lg flex items-center justify-center flex-shrink-0">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden="true"
            >
              architecture
            </span>
          </div>
          <div>
            <h2 className="text-orange-500 font-bold text-sm tracking-tight">System Architect</h2>
            <p className="text-slate-500 text-[10px] font-semibold uppercase">V1.0.4-EST</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5" aria-label="Main navigation">
        {navItems.map(item => {
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center px-6 py-3 transition-all duration-150 ${
                isActive
                  ? 'bg-orange-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span
                className="material-symbols-outlined mr-3"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <span className="text-sm font-semibold">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer actions */}
      <div className="px-6 mt-auto">
        <Link
          href="/projects/new"
          className="w-full py-3 px-4 signature-gradient text-white font-bold rounded-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-95"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
          <span className="text-xs uppercase tracking-widest">New Estimation</span>
        </Link>

        <div className="mt-6 pt-6 border-t border-slate-800">
          <button
            type="button"
            className="flex items-center text-slate-400 hover:text-white transition-colors w-full"
            onClick={() => { /* TODO: Supabase signOut */ }}
          >
            <span className="material-symbols-outlined mr-3" aria-hidden="true">logout</span>
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
