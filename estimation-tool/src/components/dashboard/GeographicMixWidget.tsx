import type { GeoMixSummary } from '@/types'

interface GeographicMixWidgetProps {
  summary: GeoMixSummary
}

export default function GeographicMixWidget({ summary }: GeographicMixWidgetProps) {
  const onshoreLocations = summary.locations.filter(l => l.location_tier !== 'offshore')
  const offshoreLocations = summary.locations.filter(l => l.location_tier === 'offshore')

  return (
    <section className="bg-surface-container-lowest rounded-md overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-surface-container-low flex justify-between items-center">
        <h2 className="text-sm font-black uppercase tracking-widest text-on-surface">
          Geographic Delivery Mix
        </h2>
        <div className="flex gap-4" aria-hidden="true">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-secondary rounded-sm" />
            <span className="text-[10px] font-bold uppercase text-on-surface-variant">Onshore</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-sm" />
            <span className="text-[10px] font-bold uppercase text-on-surface-variant">Offshore</span>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Stacked bar */}
        <div
          className="flex h-12 w-full rounded-md overflow-hidden shadow-inner"
          role="img"
          aria-label={`Delivery mix: ${summary.onshore_pct}% onshore, ${summary.offshore_pct}% offshore`}
        >
          {summary.onshore_pct > 0 && (
            <div
              className="bg-secondary flex items-center justify-center text-on-secondary text-[10px] font-black"
              style={{ width: `${summary.onshore_pct}%` }}
            >
              {summary.onshore_pct}% ONSHORE
            </div>
          )}
          {summary.offshore_pct > 0 && (
            <div
              className="signature-gradient flex items-center justify-center text-on-primary text-[10px] font-black"
              style={{ width: `${summary.offshore_pct}%` }}
            >
              {summary.offshore_pct}% OFFSHORE
            </div>
          )}
        </div>

        {/* Location breakdown */}
        <div className="grid grid-cols-2 gap-12 mt-8">
          {/* Onshore */}
          <div>
            <span className="text-[10px] font-extrabold text-secondary uppercase block mb-2">
              Key Locations
            </span>
            <ul className="space-y-2">
              {onshoreLocations.map(loc => (
                <li key={loc.id} className="flex justify-between text-[11px]">
                  <span className="font-medium text-on-surface-variant">{loc.location_name}</span>
                  <span className="font-bold text-on-surface">{loc.percentage}%</span>
                </li>
              ))}
              {onshoreLocations.length === 0 && (
                <li className="text-[11px] text-on-surface-variant italic">None configured</li>
              )}
            </ul>
          </div>

          {/* Offshore */}
          <div>
            <span className="text-[10px] font-extrabold text-primary uppercase block mb-2">
              Global Centers
            </span>
            <ul className="space-y-2">
              {offshoreLocations.map(loc => (
                <li key={loc.id} className="flex justify-between text-[11px]">
                  <span className="font-medium text-on-surface-variant">{loc.location_name}</span>
                  <span className="font-bold text-on-surface">{loc.percentage}%</span>
                </li>
              ))}
              {offshoreLocations.length === 0 && (
                <li className="text-[11px] text-on-surface-variant italic">None configured</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
