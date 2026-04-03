// Scenario Analysis page — shell. Will support forking estimations and running
// side-by-side comparisons with geo-mix and rate overrides.

export default function ScenarioAnalysisPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-on-surface tracking-tighter uppercase">
          Scenario Analysis
        </h1>
        <button
          type="button"
          className="px-5 py-2.5 border border-outline text-on-surface text-xs font-black uppercase tracking-widest rounded-md flex items-center gap-2 hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">fork_right</span>
          New Scenario
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-md p-12 text-center border border-dashed border-outline-variant">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4 block" aria-hidden="true">
          query_stats
        </span>
        <h2 className="text-base font-bold text-on-surface mb-2">No scenarios defined</h2>
        <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
          Fork a committed estimation to model &ldquo;what-if&rdquo; rate, headcount, or
          geo-mix changes without affecting the baseline.
        </p>
      </div>
    </div>
  )
}
