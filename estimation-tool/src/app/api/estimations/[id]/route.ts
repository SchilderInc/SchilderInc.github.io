import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { calculateDashboardMetrics } from '@/lib/calculations'
import type { Estimation } from '@/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('estimations')
    .select(`
      *,
      workstreams (
        *,
        resources (*)
      ),
      geo_locations (*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  const estimation = data as unknown as Estimation
  const metrics = calculateDashboardMetrics(estimation, {
    hasBaseline: estimation.baseline_cost !== null,
  })

  return NextResponse.json({ estimation, metrics })
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const body = await request.json()

  const allowed = ['version_label', 'status', 'duration_weeks', 'start_date', 'baseline_cost']
  const updates = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  )

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('estimations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
