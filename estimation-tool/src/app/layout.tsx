import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'

// Self-host Manrope — no external network request, no layout shift.
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Architectural Monolith | System Architect Dashboard',
  description: 'Work estimation and resource planning for architecture modernization projects.',
}

// Root layout: HTML shell only. Chrome (sidebar/topnav) lives in (app)/layout.tsx
// so auth pages at (auth)/ render without it.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>{children}</body>
    </html>
  )
}
