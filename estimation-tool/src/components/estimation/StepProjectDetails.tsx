import type { WizardState } from './EstimationWizard'

interface Props {
  state: WizardState
  update: (patch: Partial<WizardState>) => void
}

const DURATION_PRESETS = [
  { label: '3 mo',  weeks: 13  },
  { label: '6 mo',  weeks: 26  },
  { label: '9 mo',  weeks: 39  },
  { label: '12 mo', weeks: 52  },
  { label: '18 mo', weeks: 78  },
  { label: '24 mo', weeks: 104 },
]

export default function StepProjectDetails({ state, update }: Props) {
  return (
    <div>
      <h2 className="text-base font-black text-on-surface uppercase tracking-widest mb-1">
        Project Details
      </h2>
      <p className="text-xs text-on-surface-variant mb-8">
        Name this estimation and set the high-level timeline.
      </p>

      <div className="space-y-6">
        {/* Project name */}
        <div>
          <label htmlFor="projectName" className="block text-[10px] font-extrabold uppercase tracking-widest text-secondary mb-1.5">
            Project name <span className="text-error">*</span>
          </label>
          <input
            id="projectName"
            type="text"
            required
            value={state.projectName}
            onChange={e => update({ projectName: e.target.value })}
            className="w-full px-3 py-2.5 text-sm bg-surface-container rounded-md border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g. Core Banking Modernisation"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="projectDesc" className="block text-[10px] font-extrabold uppercase tracking-widest text-secondary mb-1.5">
            Description
          </label>
          <textarea
            id="projectDesc"
            rows={3}
            value={state.projectDescription}
            onChange={e => update({ projectDescription: e.target.value })}
            className="w-full px-3 py-2.5 text-sm bg-surface-container rounded-md border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Brief scope statement for stakeholders"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Version label */}
          <div>
            <label htmlFor="versionLabel" className="block text-[10px] font-extrabold uppercase tracking-widest text-secondary mb-1.5">
              Version label
            </label>
            <input
              id="versionLabel"
              type="text"
              value={state.versionLabel}
              onChange={e => update({ versionLabel: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-surface-container rounded-md border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
              placeholder="V1.0.0-EST"
            />
          </div>

          {/* Start date */}
          <div>
            <label htmlFor="startDate" className="block text-[10px] font-extrabold uppercase tracking-widest text-secondary mb-1.5">
              Start date
            </label>
            <input
              id="startDate"
              type="date"
              value={state.startDate}
              onChange={e => update({ startDate: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-surface-container rounded-md border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-widest text-secondary mb-2">
            Duration — {state.durationWeeks} weeks ({Math.round(state.durationWeeks / 4.33)} months)
          </label>
          <div className="flex gap-2 mb-3 flex-wrap">
            {DURATION_PRESETS.map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => update({ durationWeeks: p.weeks })}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded transition-colors ${
                  state.durationWeeks === p.weeks
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <input
            type="range"
            min={4}
            max={156}
            step={1}
            value={state.durationWeeks}
            onChange={e => update({ durationWeeks: parseInt(e.target.value) })}
            className="w-full accent-primary"
            aria-label="Project duration in weeks"
          />
        </div>
      </div>
    </div>
  )
}
