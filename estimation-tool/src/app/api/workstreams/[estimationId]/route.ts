import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

interface RouteContext {
  params: Promise<{ estimationId: string }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { estimationId } = await params
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('workstreams')
    .select('*, resources(*)')
    .eq('estimation_id', estimationId)
    .order('sort_order')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request, { params }: RouteContext) {
  const { estimationId } = await params
  const supabase = await createServerSupabaseClient()
  const body = await request.json() as {
    name: string
    description?: string
    budget_cap?: number
    sort_order?: number
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('workstreams')
    .insert({
      estimation_id: estimationId,
      name: body.name.trim(),
      description: body.description,
      budget_cap: body.budget_cap,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
