// Resource Planning page — shell. Will host a headcount timeline and rate card manager.

export default function ResourcePlanningPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full">
      <h1 className="text-2xl font-black text-on-surface tracking-tighter uppercase mb-8">
        Resource Planning
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Headcount Timeline — TODO */}
        <div className="bg-surface-container-lowest rounded-md p-8 border border-dashed border-outline-variant">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-secondary" aria-hidden="true">group</span>
            <h2 className="text-sm font-black uppercase tracking-widest text-on-surface">
              Headcount Timeline
            </h2>
          </div>
          <p className="text-sm text-on-surface-variant">
            Week-by-week FTE and consultant ramp plan — coming soon.
          </p>
        </div>

        {/* Rate Card Manager — TODO */}
        <div className="bg-surface-container-lowest rounded-md p-8 border border-dashed border-outline-variant">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-secondary" aria-hidden="true">payments</span>
            <h2 className="text-sm font-black uppercase tracking-widest text-on-surface">
              Rate Card Manager
            </h2>
          </div>
          <p className="text-sm text-on-surface-variant">
            Define and version vendor rate cards and internal FTE costs — coming soon.
          </p>
        </div>
      </div>
    </div>
  )
}
