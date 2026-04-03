import { useId } from 'react'
import type { WizardState, GeoEntry } from './EstimationWizard'

interface Props {
  state: WizardState
  update: (patch: Partial<WizardState>) => void
}

const LOCATION_PRESETS = [
  { name: 'United States (HQ)',  tier: 'onshore'  as const, rate: 185 },
  { name: 'United Kingdom',      tier: 'onshore'  as const, rate: 170 },
  { name: 'Canada',              tier: 'onshore'  as const, rate: 160 },
  { name: 'India (Bangalore)',   tier: 'offshore' as const, rate: 90  },
  { name: 'India (Hyderabad)',   tier: 'offshore' as const, rate: 85  },
  { name: 'Poland (Kraków)',     tier: 'offshore' as const, rate: 110 },
  { name: 'Romania',             tier: 'offshore' as const, rate: 100 },
  { name: 'Mexico',              tier: 'nearshore' as const, rate: 120 },
]

function newLocation(): GeoEntry {
  return {
    id: crypto.randomUUID(),
    locationName: '',
    locationTier: 'onshore',
    percentage: '0',
    avgHourlyRate: '0',
  }
}

export default function StepGeoMix({ state, update }: Props) {
  const idPrefix = useId()

  const total = state.geoLocations.reduce(
    (sum, g) => sum + (parseFloat(g.percentage) || 0), 0
  )
  const isValid = Math.abs(total - 100) < 0.5

  function addLocation() {
    update({ geoLocations: [...state.geoLocations, newLocation()] })
  }

  function removeLocation(id: string) {
    update({ geoLocations: state.geoLocations.filter(g => g.id !== id) })
  }

  function updateLocation(id: string, patch: Partial<GeoEntry>) {
    update({ geoLocations: state.geoLocations.map(g => g.id === id ? { ...g, ...patch } : g) })
  }

  function addPreset(preset: typeof LOCATION_PRESETS[0]) {
    if (!state.geoLocations.some(g => g.locationName === preset.name)) {
      update({
        geoLocations: [
          ...state.geoLocations,
          { id: crypto.randomUUID(), locationName: preset.name, locationTier: preset.tier, percentage: '0', avgHourlyRate: String(preset.rate) },
        ],
      })
    }
  }

  const onshoreTotal  = state.geoLocations.filter(g => g.locationTier !== 'offshore').reduce((s, g) => s + (parseFloat(g.percentage) || 0), 0)
  const offshoreTotal = state.geoLocations.filter(g => g.locationTier === 'offshore').reduce((s, g) => s + (parseFloat(g.percentage) || 0), 0)

  return (
    <div>
      <h2 className="text-base font-black text-on-surface uppercase tracking-widest mb-1">
        Geographic Delivery Mix
      </h2>
      <p className="text-xs text-on-surface-variant mb-6">
        Set the delivery split across locations. Percentages must sum to 100%.
      </p>

      {/* Visual mix bar */}
      {total > 0 && (
        <div className="mb-6">
          <div
            className="flex h-10 w-full rounded-lg overflow-hidden"
            role="img"
            aria-label={`Onshore ${Math.round(onshoreTotal)}%, offshore ${Math.round(offshoreTotal)}%`}
          >
            {onshoreTotal > 0 && (
              <div className="bg-secondary flex items-center justify-center text-on-secondary text-[10px] font-black transition-all"
                style={{ width: `${(onshoreTotal / Math.max(total, 100)) * 100}%` }}>
                {Math.round(onshoreTotal)}% ON
              </div>
            )}
            {offshoreTotal > 0 && (
              <div className="signature-gradient flex items-center justify-center text-on-primary text-[10px] font-black transition-all"
                style={{ width: `${(offshoreTotal / Math.max(total, 100)) * 100}%` }}>
                {Math.round(offshoreTotal)}% OFF
              </div>
            )}
            {total < 100 && (
              <div className="bg-surface-container-high flex-1 flex items-center justify-center text-on-surface-variant text-[10px]">
                {Math.round(100 - total)}% unallocated
              </div>
            )}
          </div>
          {!isValid && (
            <p className="mt-2 text-[11px] font-bold text-error" role="alert">
              Total: {Math.round(total)}% — must equal exactly 100%
            </p>
          )}
          {isValid && (
            <p className="mt-2 text-[11px] font-bold text-tertiary">
              ✓ Total: 100%
            </p>
          )}
        </div>
      )}

      {/* Location presets */}
      <div className="mb-6">
        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Quick-add locations</p>
        <div className="flex flex-wrap gap-2">
          {LOCATION_PRESETS.map(p => {
            const added = state.geoLocations.some(g => g.locationName === p.name)
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => addPreset(p)}
                disabled={added}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-full border transition-colors ${
                  added
                    ? 'bg-primary-fixed text-on-primary-fixed border-transparent cursor-default'
                    : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                } ${p.tier === 'offshore' ? 'italic' : ''}`}
              >
                {p.name} (${p.rate}/hr)
              </button>
            )
          })}
        </div>
      </div>

      {/* Location rows */}
      {state.geoLocations.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-outline-variant rounded-lg">
          <p className="text-sm text-on-surface-variant">Add at least one location.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {state.geoLocations.map((g, i) => (
            <li key={g.id} className="bg-surface-container p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <div className="col-span-2 md:col-span-1">
                <label htmlFor={`${idPrefix}-loc-name-${i}`} className="block text-[9px] font-bold uppercase tracking-widest text-secondary mb-1">
                  Location
                </label>
                <input
                  id={`${idPrefix}-loc-name-${i}`}
                  type="text"
                  value={g.locationName}
                  onChange={e => updateLocation(g.id, { locationName: e.target.value })}
                  className="w-full px-2.5 py-2 text-sm bg-surface-container-lowest rounded border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Location name"
                />
              </div>
              <div>
                <label htmlFor={`${idPrefix}-loc-tier-${i}`} className="block text-[9px] font-bold uppercase tracking-widest text-secondary mb-1">
                  Tier
                </label>
                <select
                  id={`${idPrefix}-loc-tier-${i}`}
                  value={g.locationTier}
                  onChange={e => updateLocation(g.id, { locationTier: e.target.value as GeoEntry['locationTier'] })}
                  className="w-full px-2.5 py-2 text-sm bg-surface-container-lowest rounded border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="onshore">Onshore</option>
                  <option value="offshore">Offshore</option>
                  <option value="nearshore">Nearshore</option>
                </select>
              </div>
              <div>
                <label htmlFor={`${idPrefix}-loc-pct-${i}`} className="block text-[9px] font-bold uppercase tracking-widest text-secondary mb-1">
                  % Share
                </label>
                <input
                  id={`${idPrefix}-loc-pct-${i}`}
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={g.percentage}
                  onChange={e => updateLocation(g.id, { percentage: e.target.value })}
                  className="w-full px-2.5 py-2 text-sm bg-surface-container-lowest rounded border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label htmlFor={`${idPrefix}-loc-rate-${i}`} className="block text-[9px] font-bold uppercase tracking-widest text-secondary mb-1">
                    Avg $/hr
                  </label>
                  <input
                    id={`${idPrefix}-loc-rate-${i}`}
                    type="number"
                    min={0}
                    step={5}
                    value={g.avgHourlyRate}
                    onChange={e => updateLocation(g.id, { avgHourlyRate: e.target.value })}
                    className="w-full px-2.5 py-2 text-sm bg-surface-container-lowest rounded border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeLocation(g.id)}
                  aria-label={`Remove ${g.locationName || 'location'}`}
                  className="mt-5 text-on-surface-variant hover:text-error transition-colors"
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
        onClick={addLocation}
        className="mt-4 w-full py-2.5 border border-dashed border-outline text-on-surface-variant text-xs font-bold uppercase tracking-widest rounded-lg hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
        Add location
      </button>
    </div>
  )
}
