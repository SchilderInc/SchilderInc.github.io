import { useMemo } from 'react'
import { calculateDashboardMetrics, formatFullCurrency, formatCurrency } from '@/lib/calculations'
import type { WizardState } from './EstimationWizard'
import type { Estimation } from '@/types'

interface Props {
  state: WizardState
  update: (patch: Partial<WizardState>) => void
  submitting: boolean
  submitError: string | null
  onSubmit: () => void
}

/** Convert wizard state into the Estimation shape the calc engine expects. */
function toEstimation(state: WizardState): Estimation {
  return {
    id: 'preview',
    project_id: 'preview',
    version_label: state.versionLabel,
    status: 'draft',
    duration_weeks: state.durationWeeks,
    start_date: state.startDate,
    created_by: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    workstreams: state.workstreams.map(ws => ({
      id: ws.id,
      estimation_id: 'preview',
      name: ws.name,
      sort_order: 0,
      resources: state.resources
        .filter(r => r.workstreamId === ws.id)
        .map(r => ({
          id: r.id,
          workstream_id: ws.id,
          rate_card_id: '',
          display_name: r.roleTitle,
          resource_type: r.resourceType,
          location_tier: r.locationTier,
          weekly_hours: r.weeklyHours,
          utilization_pct: r.utilizationPct,
          start_week: r.startWeek,
          end_week: r.endWeek,
          hourly_rate: r.hourlyRate,
          role_title: r.roleTitle,
        })),
    })),
    geo_locations: state.geoLocations.map(g => ({
      id: g.id,
      estimation_id: 'preview',
      location_name: g.locationName,
      location_tier: g.locationTier,
      percentage: parseFloat(g.percentage) || 0,
      avg_hourly_rate: parseFloat(g.avgHourlyRate) || 0,
    })),
  }
}

export default function StepReview({ state, submitting, submitError, onSubmit }: Props) {
  const metrics = useMemo(() => {
    const estimation = toEstimation(state)
    return calculateDashboardMetrics(estimation)
  }, [state])

  const geoTotal = state.geoLocations.reduce((s, g) => s + (parseFloat(g.percentage) || 0), 0)
  const geoValid = Math.abs(geoTotal - 100) < 0.5

  return (
    <div>
      <h2 className="text-base font-black text-on-surface uppercase tracking-widest mb-1">
        Review & Submit
      </h2>
      <p className="text-xs text-on-surface-variant mb-8">
        Review the computed metrics before creating your estimation.
      </p>

      {/* Summary grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Cost',     value: formatFullCurrency(metrics.total_estimated_cost) },
          { label: 'Duration',       value: `${metrics.duration_months} months` },
          { label: 'Peak Headcount', value: `${metrics.peak_headcount} FTEs` },
          { label: 'Weekly Run Rate', value: formatCurrency(metrics.weekly_run_rate) },
        ].map(item => (
          <div key={item.label} className="bg-surface-container p-4 rounded-lg text-center">
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-secondary mb-1">
              {item.label}
            </p>
            <p className="text-lg font-black text-on-surface">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Workstream breakdown */}
      <div className="mb-6">
        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-secondary mb-3">
          Workstream Costs
        </h3>
        {metrics.workstream_summary.length === 0 ? (
          <p className="text-xs text-on-surface-variant italic">No workstreams with resources.</p>
        ) : (
          <ul className="space-y-2">
            {metrics.workstream_summary.map(ws => (
              <li key={ws.id} className="flex justify-between items-center text-sm">
                <span className="font-medium text-on-surface-variant">{ws.name}</span>
                <span className="font-black text-on-surface">{formatCurrency(ws.cost)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confidence */}
      <div className="mb-6 p-4 bg-surface-container rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-secondary">
            Confidence Score
          </span>
          <span className="text-sm font-black text-on-surface">
            {metrics.confidence_label} ({metrics.confidence_score}%)
          </span>
        </div>
        <div className="mt-2 h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${metrics.confidence_score}%` }}
          />
        </div>
        {metrics.confidence_score < 60 && (
          <p className="mt-2 text-[11px] text-on-surface-variant">
            Add more resources and ensure geo mix totals 100% to increase confidence.
          </p>
        )}
      </div>

      {/* Validation warnings */}
      {!geoValid && (
        <div role="alert" className="mb-4 p-3 bg-error-container text-on-error-container text-xs rounded-lg font-medium">
          Geographic mix totals {Math.round(geoTotal)}% — it must equal 100% before submitting.
        </div>
      )}
      {state.workstreams.length === 0 && (
        <div role="alert" className="mb-4 p-3 bg-error-container text-on-error-container text-xs rounded-lg font-medium">
          Add at least one workstream before submitting.
        </div>
      )}
      {!state.projectName.trim() && (
        <div role="alert" className="mb-4 p-3 bg-error-container text-on-error-container text-xs rounded-lg font-medium">
          Project name is required. Go back to step 1.
        </div>
      )}

      {submitError && (
        <div role="alert" className="mb-4 p-3 bg-error-container text-on-error-container text-xs rounded-lg font-medium">
          {submitError}
        </div>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting || !geoValid || state.workstreams.length === 0 || !state.projectName.trim()}
        className="w-full py-3 signature-gradient text-on-primary text-xs font-black uppercase tracking-widest rounded-md hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Creating estimation…' : 'Create estimation'}
      </button>
    </div>
  )
}
