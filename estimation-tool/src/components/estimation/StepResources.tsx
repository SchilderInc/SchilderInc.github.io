import { useId } from 'react'
import type { WizardState, WsResource } from './EstimationWizard'

interface Props {
  state: WizardState
  update: (patch: Partial<WizardState>) => void
}

const ROLE_SUGGESTIONS = [
  'Cloud Engineer', 'Data Engineer', 'Backend Developer', 'Frontend Developer',
  'Full Stack Developer', 'DevOps Engineer', 'Security Analyst', 'UX Designer',
  'Scrum Master', 'Business Analyst', 'Solution Architect', 'QA Engineer',
]

function newResource(workstreamId: string, durationWeeks: number): WsResource {
  return {
    id: crypto.randomUUID(),
    workstreamId,
    roleTitle: '',
    resourceType: 'consultant',
    locationTier: 'onshore',
    hourlyRate: 185,
    weeklyHours: 40,
    utilizationPct: 100,
    startWeek: 0,
    endWeek: durationWeeks - 1,
  }
}

export default function StepResources({ state, update }: Props) {
  const idPrefix = useId()

  function addResource(wsId: string) {
    update({ resources: [...state.resources, newResource(wsId, state.durationWeeks)] })
  }

  function removeResource(id: string) {
    update({ resources: state.resources.filter(r => r.id !== id) })
  }

  function updateResource(id: string, patch: Partial<WsResource>) {
    update({ resources: state.resources.map(r => r.id === id ? { ...r, ...patch } : r) })
  }

  if (state.workstreams.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-3 block" aria-hidden="true">group</span>
        <p className="text-sm text-on-surface-variant">Go back and define workstreams first.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-base font-black text-on-surface uppercase tracking-widest mb-1">Resources</h2>
      <p className="text-xs text-on-surface-variant mb-8">
        Assign roles to each workstream. Costs are calculated from hourly rate × hours × duration.
      </p>

      <div className="space-y-8">
        {state.workstreams.map(ws => {
          const wsResources = state.resources.filter(r => r.workstreamId === ws.id)

          return (
            <section key={ws.id}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-secondary" aria-hidden="true">account_tree</span>
                  {ws.name}
                </h3>
                <span className="text-[10px] font-bold text-on-surface-variant">
                  {wsResources.length} resource{wsResources.length !== 1 ? 's' : ''}
                </span>
              </div>

              {wsResources.length > 0 ? (
                <ul className="space-y-3">
                  {wsResources.map((r, i) => (
                    <li key={r.id} className="bg-surface-container p-4 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Role */}
                        <div className="col-span-2">
                          <label htmlFor={`${idPrefix}-role-${i}`} className="block text-[9px] font-bold uppercase tracking-widest text-secondary mb-1">
                            Role *
                          </label>
                          <input
                            id={`${idPrefix}-role-${i}`}
                            list={`${idPrefix}-role-list`}
                            type="text"
                            value={r.roleTitle}
                            onChange={e => updateResource(r.id, { roleTitle: e.target.value })}
                            className="w-full px-2.5 py-2 text-sm bg-surface-container-lowest rounded border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="e.g. Cloud Engineer"
                          />
                          <datalist id={`${idPrefix}-role-list`}>
                            {ROLE_SUGGESTIONS.map(s => <option key={s} value={s} />)}
                          </datalist>
                        </div>

                        {/* Type */}
                        <div>
                          <label htmlFor={`${idPrefix}-type-${i}`} className="block text-[9px] font-bold uppercase tracking-widest text-secondary mb-1">
                            Type
                          </label>
                          <select
                            id={`${idPrefix}-type-${i}`}
                            value={r.resourceType}
                            onChange={e => updateResource(r.id, { resourceType: e.target.value as WsResource['resourceType'] })}
                            className="w-full px-2.5 py-2 text-sm bg-surface-container-lowest rounded border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="consultant">Consultant</option>
                            <option value="full_time">Full-time</option>
                          </select>
                        </div>

                        {/* Location */}
                        <div>
                          <label htmlFor={`${idPrefix}-loc-${i}`} className="block text-[9px] font-bold uppercase tracking-widest text-secondary mb-1">
                            Location
                          </label>
                          <select
                            id={`${idPrefix}-loc-${i}`}
                            value={r.locationTier}
                            onChange={e => updateResource(r.id, { locationTier: e.target.value as WsResource['locationTier'] })}
                            className="w-full px-2.5 py-2 text-sm bg-surface-container-lowest rounded border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="onshore">Onshore</option>
                            <option value="offshore">Offshore</option>
                            <option value="nearshore">Nearshore</option>
                          </select>
                        </div>

                        {/* Rate */}
                        <div>
                          <label htmlFor={`${idPrefix}-rate-${i}`} className="block text-[9px] font-bold uppercase tracking-widest text-secondary mb-1">
                            Hourly rate (USD)
                          </label>
                          <input
                            id={`${idPrefix}-rate-${i}`}
                            type="number"
                            min={0}
                            step={5}
                            value={r.hourlyRate}
                            onChange={e => updateResource(r.id, { hourlyRate: parseFloat(e.target.value) || 0 })}
                            className="w-full px-2.5 py-2 text-sm bg-surface-container-lowest rounded border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        {/* Utilization */}
                        <div>
                          <label htmlFor={`${idPrefix}-util-${i}`} className="block text-[9px] font-bold uppercase tracking-widest text-secondary mb-1">
                            Utilization %
                          </label>
                          <input
                            id={`${idPrefix}-util-${i}`}
                            type="number"
                            min={10}
                            max={100}
                            step={5}
                            value={r.utilizationPct}
                            onChange={e => updateResource(r.id, { utilizationPct: parseInt(e.target.value) || 100 })}
                            className="w-full px-2.5 py-2 text-sm bg-surface-container-lowest rounded border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        {/* Week range */}
                        <div>
                          <label htmlFor={`${idPrefix}-start-${i}`} className="block text-[9px] font-bold uppercase tracking-widest text-secondary mb-1">
                            Start week
                          </label>
                          <input
                            id={`${idPrefix}-start-${i}`}
                            type="number"
                            min={0}
                            max={state.durationWeeks - 1}
                            value={r.startWeek}
                            onChange={e => updateResource(r.id, { startWeek: parseInt(e.target.value) || 0 })}
                            className="w-full px-2.5 py-2 text-sm bg-surface-container-lowest rounded border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label htmlFor={`${idPrefix}-end-${i}`} className="block text-[9px] font-bold uppercase tracking-widest text-secondary mb-1">
                            End week
                          </label>
                          <input
                            id={`${idPrefix}-end-${i}`}
                            type="number"
                            min={r.startWeek}
                            max={state.durationWeeks - 1}
                            value={r.endWeek}
                            onChange={e => updateResource(r.id, { endWeek: parseInt(e.target.value) || r.startWeek })}
                            className="w-full px-2.5 py-2 text-sm bg-surface-container-lowest rounded border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeResource(r.id)}
                        aria-label="Remove resource"
                        className="mt-3 text-[10px] text-on-surface-variant hover:text-error transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">delete</span>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-on-surface-variant italic mb-2">No resources yet.</p>
              )}

              <button
                type="button"
                onClick={() => addResource(ws.id)}
                className="mt-2 px-4 py-2 border border-dashed border-outline-variant text-on-surface-variant text-[10px] font-bold uppercase tracking-widest rounded hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
                Add resource to {ws.name}
              </button>
            </section>
          )
        })}
      </div>
    </div>
  )
}
