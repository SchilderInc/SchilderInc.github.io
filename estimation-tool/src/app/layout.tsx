import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'

import Sidebar from '@/components/layout/Sidebar'
import TopNav from '@/components/layout/TopNav'
import MobileNav from '@/components/layout/MobileNav'

// Self-host Manrope via next/font — eliminates external network request,
// prevents layout shift, and fixes the broken `font-manrope` class from Stitch.
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="flex-1 md:ml-64 flex flex-col">
            <TopNav />

            <main id="main-content" className="flex-1 pb-20 md:pb-0">
              {children}
            </main>
          </div>
        </div>

        <MobileNav />
      </body>
    </html>
  )
}
