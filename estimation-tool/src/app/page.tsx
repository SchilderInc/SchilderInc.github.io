// Dashboard page — Server Component.
// Fetches the active estimation for the current session and computes metrics.
// Falls back to representative seed data when Supabase is not yet connected.

import MetricCard from '@/components/ui/MetricCard'
import RateOptimizationWidget from '@/components/dashboard/RateOptimizationWidget'
import GeographicMixWidget from '@/components/dashboard/GeographicMixWidget'
import WorkstreamAllocation from '@/components/dashboard/WorkstreamAllocation'
import AuditLog from '@/components/dashboard/AuditLog'
import { calculateDashboardMetrics, formatFullCurrency } from '@/lib/calculations'
import type { DashboardMetrics, AuditEvent, ReviewComment } from '@/types'
import { SEED_ESTIMATION, SEED_EVENTS, SEED_COMMENTS } from '@/lib/seed'

// In production, replace this with a real Supabase fetch:
//   const supabase = await createServerSupabaseClient()
//   const { data } = await supabase.from('estimations').select('*, workstreams(*, resources(*)), geo_locations(*)').eq('status', 'committed').single()
async function getMetrics(): Promise<{
  metrics: DashboardMetrics
  events: AuditEvent[]
  comments: ReviewComment[]
}> {
  const metrics = calculateDashboardMetrics(SEED_ESTIMATION, {
    hasBaseline: true,
    hasScenarios: true,
  })
  return { metrics, events: SEED_EVENTS, comments: SEED_COMMENTS }
}

export default async function DashboardPage() {
  const { metrics, events, comments } = await getMetrics()
  const confidencePips = Math.round(metrics.confidence_score / 20) // 0–5

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full">
      {/* ── Core Metrics ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          label="Total Estimated Cost"
          value={formatFullCurrency(metrics.total_estimated_cost)}
          trend={
            metrics.vs_baseline_pct !== null
              ? {
                  value: `${metrics.vs_baseline_pct > 0 ? '+' : ''}${metrics.vs_baseline_pct}% vs Baseline`,
                  direction: metrics.vs_baseline_pct > 0 ? 'up' : 'down',
                }
              : undefined
          }
          accent="primary"
        />
        <MetricCard
          label="Project Duration"
          value={`${metrics.duration_months} Months`}
          subtext={`Target End: ${metrics.target_end_date}`}
          accent="secondary"
        />
        <MetricCard
          label="Peak Headcount"
          value={`${metrics.peak_headcount} FTEs`}
          subtext={`Resource Utilization: ${metrics.resource_utilization_pct}%`}
          accent="tertiary"
        />
        <MetricCard
          label="Weekly Run Rate"
          value={formatFullCurrency(metrics.weekly_run_rate)}
          subtext={`Monthly: ${formatFullCurrency(metrics.monthly_run_rate)}`}
          accent="warning"
        />
      </div>

      {/* ── Main Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: analytics */}
        <div className="lg:col-span-8 space-y-8">
          <RateOptimizationWidget
            consultantAHR={metrics.consultant_ahr}
            internalADR={metrics.internal_adr}
            rateGapPct={metrics.rate_gap_pct}
            savings={metrics.savings_potential}
          />
          <GeographicMixWidget summary={metrics.geo_mix_summary} />
        </div>

        {/* Right: allocation + log */}
        <div className="lg:col-span-4 space-y-8">
          <WorkstreamAllocation workstreams={metrics.workstream_summary} />
          <AuditLog events={events} comments={comments} />
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="mt-12 pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Confidence score */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
              Confidence Score
            </span>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-0.5" role="img" aria-label={`Confidence: ${metrics.confidence_label} (${metrics.confidence_score}%)`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-1.5 rounded-full ${
                      i < confidencePips ? 'bg-primary' : 'bg-outline-variant'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-black">
                {metrics.confidence_label} ({metrics.confidence_score}%)
              </span>
            </div>
          </div>
        </div>

        <p className="text-[10px] font-medium text-on-surface-variant max-w-md text-right leading-tight">
          Proprietary Calculation Engine &copy; {new Date().getFullYear()} Architectural Monolith.
          All financial figures are based on internal HR cost centers and vendor-provided Rate Cards.
        </p>
      </footer>
    </div>
  )
}
