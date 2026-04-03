// ─────────────────────────────────────────────────────────────────────────────
// Estimation Calculation Engine
//
// Pure functions — no side effects, no I/O. All inputs are typed domain
// objects; all outputs are plain numbers or typed result objects.
//
// Formulas:
//   Resource weekly cost  = hourly_rate × weekly_hours × (utilization_pct / 100)
//   Workstream cost       = Σ resource_weekly_cost × active_weeks
//   Total cost            = Σ workstream_cost
//   Weekly run rate       = Σ resource_weekly_cost  (at peak overlap week)
//   Blended rate          = total_cost / total_effective_hours
//   Confidence score      = weighted average of completeness factors (0–100)
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Resource,
  Workstream,
  Estimation,
  DashboardMetrics,
  WorkstreamSummary,
  GeoMixSummary,
  SavingsPotential,
} from '@/types'

// ── Resource ──────────────────────────────────────────────────────────────────

/** Cost for a single resource over their assigned duration. */
export function calculateResourceCost(resource: Resource): number {
  const activeWeeks = resource.end_week - resource.start_week + 1
  const weeklyEffectiveHours = resource.weekly_hours * (resource.utilization_pct / 100)
  return resource.hourly_rate * weeklyEffectiveHours * activeWeeks
}

/** Weekly cost for a single resource (at full utilization schedule). */
export function calculateResourceWeeklyCost(resource: Resource): number {
  return resource.hourly_rate * resource.weekly_hours * (resource.utilization_pct / 100)
}

// ── Workstream ────────────────────────────────────────────────────────────────

export function calculateWorkstreamCost(workstream: Workstream): number {
  return workstream.resources.reduce(
    (sum, r) => sum + calculateResourceCost(r),
    0
  )
}

export function calculateWorkstreamHeadcount(workstream: Workstream): number {
  // Peak concurrent headcount: count resources whose ranges are active simultaneously.
  // Simplified to total unique resources (proper implementation needs week-by-week scan).
  return workstream.resources.length
}

// ── Estimation ────────────────────────────────────────────────────────────────

export function calculateTotalCost(estimation: Estimation): number {
  return estimation.workstreams.reduce(
    (sum, ws) => sum + calculateWorkstreamCost(ws),
    0
  )
}

/** Peak weekly run rate across all workstreams. */
export function calculateWeeklyRunRate(estimation: Estimation): number {
  const allResources = estimation.workstreams.flatMap(ws => ws.resources)

  // Find peak week: scan all weeks and sum active resources' weekly costs.
  if (allResources.length === 0) return 0

  const maxWeek = Math.max(...allResources.map(r => r.end_week))
  let peakRate = 0

  for (let week = 0; week <= maxWeek; week++) {
    const weekRate = allResources
      .filter(r => r.start_week <= week && r.end_week >= week)
      .reduce((sum, r) => sum + calculateResourceWeeklyCost(r), 0)
    if (weekRate > peakRate) peakRate = weekRate
  }

  return peakRate
}

/** Peak concurrent headcount across all workstreams. */
export function calculatePeakHeadcount(estimation: Estimation): number {
  const allResources = estimation.workstreams.flatMap(ws => ws.resources)
  if (allResources.length === 0) return 0

  const maxWeek = Math.max(...allResources.map(r => r.end_week))
  let peak = 0

  for (let week = 0; week <= maxWeek; week++) {
    const active = allResources.filter(
      r => r.start_week <= week && r.end_week >= week
    ).length
    if (active > peak) peak = active
  }

  return peak
}

/** Average resource utilization across all active resources (%). */
export function calculateResourceUtilization(estimation: Estimation): number {
  const all = estimation.workstreams.flatMap(ws => ws.resources)
  if (all.length === 0) return 0
  return all.reduce((sum, r) => sum + r.utilization_pct, 0) / all.length
}

// ── Rate Analysis ─────────────────────────────────────────────────────────────

/** Average hourly rate for consultant resources. */
export function calculateConsultantAHR(estimation: Estimation): number {
  const consultants = estimation.workstreams
    .flatMap(ws => ws.resources)
    .filter(r => r.resource_type === 'consultant')

  if (consultants.length === 0) return 0
  return consultants.reduce((sum, r) => sum + r.hourly_rate, 0) / consultants.length
}

/** Average hourly rate for full-time internal resources. */
export function calculateInternalADR(estimation: Estimation): number {
  const internals = estimation.workstreams
    .flatMap(ws => ws.resources)
    .filter(r => r.resource_type === 'full_time')

  if (internals.length === 0) return 0
  return internals.reduce((sum, r) => sum + r.hourly_rate, 0) / internals.length
}

/** % gap between consultant AHR and internal ADR. */
export function calculateRateGap(ahr: number, adr: number): number {
  if (adr === 0) return 0
  return ((ahr - adr) / adr) * 100
}

// ── Savings Potential ─────────────────────────────────────────────────────────

/**
 * Estimate savings available through sourcing consolidation and rate renegotiation.
 *
 * Consolidated sourcing:   assumes 10% rate reduction on consultant hours above
 *                          a single-vendor threshold (>=5 consultants).
 * Rate renegotiation:      assumes 5% reduction on all consultant rates.
 */
export function calculateSavingsPotential(
  estimation: Estimation
): SavingsPotential {
  const consultants = estimation.workstreams
    .flatMap(ws => ws.resources)
    .filter(r => r.resource_type === 'consultant')

  const totalConsultantCost = consultants.reduce(
    (sum, r) => sum + calculateResourceCost(r),
    0
  )

  const consolidatedSourcing =
    consultants.length >= 5 ? totalConsultantCost * 0.1 : 0
  const rateRenegotiation = totalConsultantCost * 0.05

  return {
    consolidated_sourcing: Math.round(consolidatedSourcing),
    rate_renegotiation: Math.round(rateRenegotiation),
    total: Math.round(consolidatedSourcing + rateRenegotiation),
  }
}

// ── Confidence Score ──────────────────────────────────────────────────────────

/**
 * Scores the estimation's reliability on a 0–100 scale based on data completeness.
 *
 * Factors and weights:
 *   - All workstreams have at least one resource      (30 pts)
 *   - All resources have rates from a named rate card (25 pts)
 *   - Geo mix percentages sum to 100                  (20 pts)
 *   - A committed baseline exists for comparison      (15 pts)
 *   - At least one scenario has been defined          (10 pts)
 */
export function calculateConfidenceScore(
  estimation: Estimation,
  {
    hasBaseline = false,
    hasScenarios = false,
  }: { hasBaseline?: boolean; hasScenarios?: boolean } = {}
): number {
  let score = 0

  // Workstreams have resources
  const allHaveResources = estimation.workstreams.every(
    ws => ws.resources.length > 0
  )
  if (estimation.workstreams.length > 0 && allHaveResources) score += 30

  // All resources have a rate card
  const allHaveRates = estimation.workstreams
    .flatMap(ws => ws.resources)
    .every(r => r.rate_card_id && r.hourly_rate > 0)
  if (allHaveRates) score += 25

  // Geo mix sums to 100%
  const geoTotal = estimation.geo_locations.reduce(
    (sum, g) => sum + g.percentage,
    0
  )
  if (Math.abs(geoTotal - 100) < 0.1) score += 20

  // Baseline exists
  if (hasBaseline) score += 15

  // Scenarios defined
  if (hasScenarios) score += 10

  return Math.min(score, 100)
}

export function confidenceLabel(
  score: number
): 'Low' | 'Medium' | 'High' {
  if (score >= 75) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
}

// ── Geo Mix Summary ───────────────────────────────────────────────────────────

export function calculateGeoMixSummary(estimation: Estimation): GeoMixSummary {
  const offshore = estimation.geo_locations
    .filter(g => g.location_tier === 'offshore')
    .reduce((sum, g) => sum + g.percentage, 0)

  const onshore = estimation.geo_locations
    .filter(g => g.location_tier !== 'offshore')
    .reduce((sum, g) => sum + g.percentage, 0)

  return {
    onshore_pct: Math.round(onshore),
    offshore_pct: Math.round(offshore),
    locations: estimation.geo_locations,
  }
}

// ── Full Dashboard Metrics ────────────────────────────────────────────────────

export function calculateDashboardMetrics(
  estimation: Estimation,
  opts: { hasBaseline?: boolean; hasScenarios?: boolean } = {}
): DashboardMetrics {
  const totalCost = calculateTotalCost(estimation)
  const weeklyRunRate = calculateWeeklyRunRate(estimation)
  const peakHeadcount = calculatePeakHeadcount(estimation)
  const utilization = calculateResourceUtilization(estimation)
  const consultantAHR = calculateConsultantAHR(estimation)
  const internalADR = calculateInternalADR(estimation)
  const rateGap = calculateRateGap(consultantAHR, internalADR)
  const savings = calculateSavingsPotential(estimation)
  const confidence = calculateConfidenceScore(estimation, opts)

  const durationMonths = Math.round(estimation.duration_weeks / 4.33)
  const startDate = new Date(estimation.start_date)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + estimation.duration_weeks * 7)

  const vsPct = estimation.baseline_cost
    ? ((totalCost - estimation.baseline_cost) / estimation.baseline_cost) * 100
    : null

  const workstreamSummaries: WorkstreamSummary[] = estimation.workstreams.map(ws => {
    const cost = calculateWorkstreamCost(ws)
    return {
      id: ws.id,
      name: ws.name,
      cost,
      total_cost: totalCost,
      pct_of_total: totalCost > 0 ? (cost / totalCost) * 100 : 0,
    }
  })

  return {
    total_estimated_cost: Math.round(totalCost),
    duration_weeks: estimation.duration_weeks,
    duration_months: durationMonths,
    target_end_date: endDate.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    }),
    peak_headcount: peakHeadcount,
    resource_utilization_pct: Math.round(utilization),
    weekly_run_rate: Math.round(weeklyRunRate),
    monthly_run_rate: Math.round(weeklyRunRate * 4.33),
    vs_baseline_pct: vsPct !== null ? Math.round(vsPct * 10) / 10 : null,
    confidence_score: confidence,
    confidence_label: confidenceLabel(confidence),
    consultant_ahr: Math.round(consultantAHR * 100) / 100,
    internal_adr: Math.round(internalADR * 100) / 100,
    rate_gap_pct: Math.round(rateGap * 10) / 10,
    savings_potential: savings,
    workstream_summary: workstreamSummaries,
    geo_mix_summary: calculateGeoMixSummary(estimation),
  }
}

// ── Formatting Helpers ────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `$${Math.round(value / 1_000)}K`
  }
  return `$${value.toLocaleString()}`
}

export function formatFullCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}
