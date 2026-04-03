import { useId } from 'react'
import type { WizardState, WsEntry } from './EstimationWizard'

interface Props {
  state: WizardState
  update: (patch: Partial<WizardState>) => void
}

function newWorkstream(): WsEntry {
  return { id: crypto.randomUUID(), name: '', description: '', budgetCap: '' }
}

const SUGGESTIONS = [
  'Cloud Infrastructure',
  'Data Engineering',
  'UX/UI Modernisation',
  'DevOps & CI/CD',
  'Security & Compliance',
  'API Integration',
  'Quality Assurance',
  'Change Management',
]

export default function StepWorkstreams({ state, update }: Props) {
  const idPrefix = useId()

  function addWorkstream() {
    update({ workstreams: [...state.workstreams, newWorkstream()] })
  }

  function removeWorkstream(id: string) {
    update({
      workstreams: state.workstreams.filter(ws => ws.id !== id),
      resources:   state.resources.filter(r => r.workstreamId !== id),
    })
  }

  function updateWorkstream(id: string, patch: Partial<WsEntry>) {
    update({
      workstreams: state.workstreams.map(ws => ws.id === id ? { ...ws, ...patch } : ws),
    })
  }

  function addSuggestion(name: string) {
    if (!state.workstreams.some(ws => ws.name === name)) {
      update({ workstreams: [...state.workstreams, { ...newWorkstream(), name }] })
    }
  }

  return (
    <div>
      <h2 className="text-base font-black text-on-surface uppercase tracking-widest mb-1">
        Workstreams
      </h2>
      <p className="text-xs text-on-surface-variant mb-6">
        Define the major areas of work. Resources and costs will be assigned per workstream.
      </p>

      {/* Quick-add suggestions */}
      <div className="mb-6">
        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">
          Common workstreams — click to add
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map(name => {
            const alreadyAdded = state.workstreams.some(ws => ws.name === name)
            return (
              <button
                key={name}
                type="button"
                onClick={() => addSuggestion(name)}
                disabled={alreadyAdded}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-full border transition-colors ${
                  alreadyAdded
                    ? 'bg-primary-fixed text-on-primary-fixed border-transparent cursor-default'
                    : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                }`}
              >
                {alreadyAdded && (
                  <span className="material-symbols-outlined text-[10px] mr-1" aria-hidden="true">check</span>
                )}
                {name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Workstream list */}
      {state.workstreams.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-outline-variant rounded-lg">
          <span className="material-symbols-outlined text-3xl text-on-surface-variant block mb-2" aria-hidden="true">
            account_tree
          </span>
          <p className="text-sm text-on-surface-variant">
            Add at least one workstream to continue.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {state.workstreams.map((ws, i) => (
            <li key={ws.id} className="bg-surface-container p-4 rounded-lg">
              <div className="flex items-start gap-4">
                <span className="mt-2.5 text-[10px] font-black text-on-surface-variant uppercase w-4 text-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label htmlFor={`${idPrefix}-ws-name-${i}`} className="block text-[9px] font-bold uppercase tracking-widest text-secondary mb-1">
                      Name *
                    </label>
                    <input
                      id={`${idPrefix}-ws-name-${i}`}
                      type="text"
                      required
                      value={ws.name}
                      onChange={e => updateWorkstream(ws.id, { name: e.target.value })}
                      className="w-full px-2.5 py-2 text-sm bg-surface-container-lowest rounded border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Workstream name"
                    />
                  </div>
                  <div>
                    <label htmlFor={`${idPrefix}-ws-cap-${i}`} className="block text-[9px] font-bold uppercase tracking-widest text-secondary mb-1">
                      Budget cap (USD)
                    </label>
                    <input
                      id={`${idPrefix}-ws-cap-${i}`}
                      type="number"
                      min={0}
                      value={ws.budgetCap}
                      onChange={e => updateWorkstream(ws.id, { budgetCap: e.target.value })}
                      className="w-full px-2.5 py-2 text-sm bg-surface-container-lowest rounded border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeWorkstream(ws.id)}
                  aria-label={`Remove ${ws.name || 'workstream'}`}
                  className="mt-6 text-on-surface-variant hover:text-error transition-colors flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">delete</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={addWorkstream}
        className="mt-4 w-full py-2.5 border border-dashed border-outline text-on-surface-variant text-xs font-bold uppercase tracking-widest rounded-lg hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
        Add workstream
      </button>
    </div>
  )
}
