// Projects page — shell. Wire up Supabase query once auth is configured.

export default function ProjectsPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-on-surface tracking-tighter uppercase">
          Projects
        </h1>
        <a
          href="/projects/new"
          className="px-5 py-2.5 signature-gradient text-on-primary text-xs font-black uppercase tracking-widest rounded-md flex items-center gap-2 hover:opacity-90 transition-opacity active:scale-95"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
          New Estimation
        </a>
      </div>

      {/* TODO: Replace with <ProjectList /> fetching from /api/projects */}
      <div className="bg-surface-container-lowest rounded-md p-12 text-center border border-dashed border-outline-variant">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4 block" aria-hidden="true">
          architecture
        </span>
        <h2 className="text-base font-bold text-on-surface mb-2">No projects yet</h2>
        <p className="text-sm text-on-surface-variant mb-6">
          Create your first project to start building estimations.
        </p>
        <a
          href="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary text-xs font-black uppercase tracking-widest rounded-md hover:opacity-90 transition-opacity"
        >
          Get started
        </a>
      </div>
    </div>
  )
}
