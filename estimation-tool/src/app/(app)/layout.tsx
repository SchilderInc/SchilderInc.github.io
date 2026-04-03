import Sidebar from '@/components/layout/Sidebar'
import TopNav from '@/components/layout/TopNav'
import MobileNav from '@/components/layout/MobileNav'

// Authenticated shell: all routes inside (app)/ get the sidebar + topnav.
// Auth routes at (auth)/ bypass this layout entirely.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col">
        <TopNav />
        <main id="main-content" className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  )
}
