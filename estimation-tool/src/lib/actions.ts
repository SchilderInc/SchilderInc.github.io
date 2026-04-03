'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'

// ── Auth Actions ──────────────────────────────────────────────────────────────
// Server Actions called directly from Client Component forms.
// The first argument is always `prevState` (from useActionState); second is FormData.

export interface ActionResult {
  error?: string
  message?: string
}

export async function signIn(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email    = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect('/')
}

export async function signUp(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const fullName = (formData.get('full_name') as string)?.trim()
  const email    = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!fullName) return { error: 'Full name is required.' }
  if (!email)    return { error: 'Email is required.' }
  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })

  if (error) {
    return { error: error.message }
  }

  return {
    message: 'Account created! Check your email to confirm before signing in.',
  }
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ── Estimation Actions ────────────────────────────────────────────────────────

export interface EstimationFormData {
  projectName: string
  projectDescription: string
  versionLabel: string
  startDate: string
  durationWeeks: number
  workstreams: Array<{
    name: string
    description: string
    budgetCap: number | null
    resources: Array<{
      roleTitle: string
      resourceType: 'consultant' | 'full_time'
      locationTier: 'onshore' | 'offshore' | 'nearshore'
      hourlyRate: number
      weeklyHours: number
      utilizationPct: number
      startWeek: number
      endWeek: number
    }>
  }>
  geoLocations: Array<{
    locationName: string
    locationTier: 'onshore' | 'offshore' | 'nearshore'
    percentage: number
    avgHourlyRate: number
  }>
}

export async function createEstimation(
  payload: EstimationFormData
): Promise<{ id: string } | { error: string }> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  // 1. Create or find project
  const { data: project, error: projErr } = await supabase
    .from('projects')
    .insert({ name: payload.projectName, description: payload.projectDescription, owner_id: user.id })
    .select('id')
    .single()

  if (projErr) return { error: projErr.message }

  // 2. Create estimation
  const { data: estimation, error: estErr } = await supabase
    .from('estimations')
    .insert({
      project_id:     project.id,
      version_label:  payload.versionLabel,
      status:         'draft',
      duration_weeks: payload.durationWeeks,
      start_date:     payload.startDate,
      created_by:     user.id,
    })
    .select('id')
    .single()

  if (estErr) return { error: estErr.message }

  // 3. Create workstreams + resources
  for (let wsIdx = 0; wsIdx < payload.workstreams.length; wsIdx++) {
    const ws = payload.workstreams[wsIdx]
    const { data: workstream, error: wsErr } = await supabase
      .from('workstreams')
      .insert({
        estimation_id: estimation.id,
        name:          ws.name,
        description:   ws.description,
        budget_cap:    ws.budgetCap,
        sort_order:    wsIdx,
      })
      .select('id')
      .single()

    if (wsErr) return { error: wsErr.message }

    if (ws.resources.length > 0) {
      const { error: resErr } = await supabase.from('resources').insert(
        ws.resources.map((r, i) => ({
          workstream_id:   workstream.id,
          display_name:    `${r.roleTitle} #${i + 1}`,
          resource_type:   r.resourceType,
          location_tier:   r.locationTier,
          hourly_rate:     r.hourlyRate,
          weekly_hours:    r.weeklyHours,
          utilization_pct: r.utilizationPct,
          start_week:      r.startWeek,
          end_week:        r.endWeek,
          role_title:      r.roleTitle,
        }))
      )
      if (resErr) return { error: resErr.message }
    }
  }

  // 4. Create geo locations
  if (payload.geoLocations.length > 0) {
    const { error: geoErr } = await supabase.from('geo_locations').insert(
      payload.geoLocations.map(g => ({
        estimation_id:   estimation.id,
        location_name:   g.locationName,
        location_tier:   g.locationTier,
        percentage:      g.percentage,
        avg_hourly_rate: g.avgHourlyRate,
      }))
    )
    if (geoErr) return { error: geoErr.message }
  }

  // 5. Log creation event
  await supabase.from('audit_events').insert({
    estimation_id: estimation.id,
    event_kind:    'estimation_created',
    actor_id:      user.id,
    actor_name:    user.user_metadata?.full_name ?? user.email,
    actor_role:    'architect',
    description:   `Estimation "${payload.versionLabel}" created.`,
  })

  return { id: estimation.id }
}
