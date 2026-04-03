// Auth layout — centered card, no sidebar or topnav.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
      {/* Brand mark */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-12 h-12 signature-gradient rounded-xl flex items-center justify-center shadow-md">
          <span
            className="material-symbols-outlined text-white text-2xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            architecture
          </span>
        </div>
        <div className="text-center">
          <h1 className="text-sm font-black uppercase tracking-widest text-on-surface">
            Architectural Monolith
          </h1>
          <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mt-0.5">
            System Architect Platform
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-xl shadow-md p-8">
        {children}
      </div>

      <p className="mt-8 text-[10px] text-on-surface-variant text-center">
        &copy; {new Date().getFullYear()} Architectural Monolith. All rights reserved.
      </p>
    </div>
  )
}
