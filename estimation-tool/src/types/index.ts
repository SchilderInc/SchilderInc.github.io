// ─────────────────────────────────────────────────────────────────────────────
// Core domain types for the Architectural Monolith estimation platform.
// These mirror the Supabase database schema (see supabase/migrations/).
// ─────────────────────────────────────────────────────────────────────────────

// ── Enumerations ─────────────────────────────────────────────────────────────

export type ResourceType = 'consultant' | 'full_time'
export type LocationTier = 'onshore' | 'offshore' | 'nearshore'
export type EstimationStatus = 'draft' | 'under_review' | 'approved' | 'committed'
export type AuditEventKind =
  | 'estimation_created'
  | 'estimation_updated'
  | 'workstream_added'
  | 'workstream_updated'
  | 'resource_added'
  | 'resource_removed'
  | 'geo_mix_changed'
  | 'scenario_created'
  | 'approval_requested'
  | 'approval_granted'
  | 'comment_added'
  | 'snapshot_committed'

// ── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  full_name: string
  role: 'architect' | 'cio' | 'viewer'
  avatar_url?: string
  created_at: string
}

// ── Project ───────────────────────────────────────────────────────────────────

export interface Project {
  id: string
  name: string
  description?: string
  owner_id: string
  created_at: string
  updated_at: string
}

// ── Rate Card ─────────────────────────────────────────────────────────────────
// Vendor or internal rate card — defines the hourly rate for a role in a region.

export interface RateCard {
  id: string
  project_id: string
  role_title: string              // e.g. "Node.js Specialist", "Data Engineer"
  resource_type: ResourceType
  location_tier: LocationTier
  hourly_rate: number             // USD
  effective_from: string          // ISO date
  effective_to?: string           // ISO date — null = still active
  vendor_name?: string            // null for internal FTE rates
  created_at: string
}

// ── Resource ─────────────────────────────────────────────────────────────────
// An individual person (or role slot) assigned to a workstream.

export interface Resource {
  id: string
  workstream_id: string
  rate_card_id: string
  display_name: string            // e.g. "Node.js Specialist #3"
  resource_type: ResourceType
  location_tier: LocationTier
  weekly_hours: number            // standard: 40
  utilization_pct: number         // 0–100
  start_week: number              // week offset from estimation start (0-indexed)
  end_week: number                // week offset — inclusive
  // Denormalized from rate_card for display speed:
  hourly_rate: number
  role_title: string
}

// ── Workstream ────────────────────────────────────────────────────────────────

export interface Workstream {
  id: string
  estimation_id: string
  name: string
  description?: string
  sort_order: number
  budget_cap?: number             // optional hard cap in USD
  resources: Resource[]
  // Computed by calculateWorkstreamCost():
  computed_cost?: number
  computed_headcount?: number
}

// ── Geo Mix ───────────────────────────────────────────────────────────────────
// Describes the geographic delivery split for an estimation.

export interface GeoLocation {
  id: string
  estimation_id: string
  location_name: string           // e.g. "United States (HQ)"
  location_tier: LocationTier
  percentage: number              // must sum to 100 across all rows for one estimation
  avg_hourly_rate: number
}

// ── Estimation ────────────────────────────────────────────────────────────────
// A versioned snapshot of cost/resource data for a project.

export interface Estimation {
  id: string
  project_id: string
  version_label: string           // e.g. "V1.0.4-EST"
  status: EstimationStatus
  duration_weeks: number
  start_date: string              // ISO date
  baseline_cost?: number          // cost of the previous committed estimation for % diff
  workstreams: Workstream[]
  geo_locations: GeoLocation[]
  created_by: string
  created_at: string
  updated_at: string
}

// ── Scenario ─────────────────────────────────────────────────────────────────
// A forked "what-if" alternative to a base estimation.

export interface Scenario {
  id: string
  base_estimation_id: string
  name: string                    // e.g. "Aggressive Modernization"
  description?: string
  overrides: ScenarioOverride[]
  computed_cost?: number
  created_by: string
  created_at: string
}

export interface ScenarioOverride {
  field: 'geo_mix' | 'rate' | 'headcount' | 'duration'
  workstream_id?: string
  location_id?: string
  original_value: number
  override_value: number
}

// ── Audit Event ───────────────────────────────────────────────────────────────

export interface AuditEvent {
  id: string
  estimation_id: string
  event_kind: AuditEventKind
  actor_id: string
  actor_name: string
  actor_role: string
  description: string
  metadata?: Record<string, unknown>
  created_at: string
}

// ── Review Comment ────────────────────────────────────────────────────────────

export interface ReviewComment {
  id: string
  estimation_id: string
  author_id: string
  author_name: string
  author_role: string
  body: string
  resolved: boolean
  created_at: string
}

// ── Computed Dashboard Metrics ────────────────────────────────────────────────
// Returned by the calculation engine — not stored directly.

export interface DashboardMetrics {
  total_estimated_cost: number
  duration_weeks: number
  duration_months: number
  target_end_date: string
  peak_headcount: number
  resource_utilization_pct: number
  weekly_run_rate: number
  monthly_run_rate: number
  vs_baseline_pct: number | null   // null if no baseline exists
  confidence_score: number          // 0–100
  confidence_label: 'Low' | 'Medium' | 'High'
  consultant_ahr: number            // average hourly rate for consultants
  internal_adr: number              // average daily-equivalent rate for FTEs
  rate_gap_pct: number
  savings_potential: SavingsPotential
  workstream_summary: WorkstreamSummary[]
  geo_mix_summary: GeoMixSummary
}

export interface SavingsPotential {
  consolidated_sourcing: number
  rate_renegotiation: number
  total: number
}

export interface WorkstreamSummary {
  id: string
  name: string
  cost: number
  total_cost: number              // total for % bar calculation
  pct_of_total: number
}

export interface GeoMixSummary {
  onshore_pct: number
  offshore_pct: number
  locations: GeoLocation[]
}
