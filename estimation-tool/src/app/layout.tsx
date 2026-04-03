import type { Metadata } from 'next'
import './globals.css'

/*
 * Font note:
 * In this environment Google Fonts isn't reachable at build time, so
 * --font-manrope is defined as a CSS variable in globals.css pointing to
 * system-ui as a near-identical fallback.
 *
 * On Vercel (which has internet at build time), swap this back to:
 *   import { Manrope } from 'next/font/google'
 *   const manrope = Manrope({ subsets: ['latin'], weight: [...], variable: '--font-manrope', display: 'swap' })
 * and add  className={manrope.variable}  to <html>.
 */

export const metadata: Metadata = {
  title: 'Architectural Monolith | System Architect Dashboard',
  description: 'Work estimation and resource planning for architecture modernization projects.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
