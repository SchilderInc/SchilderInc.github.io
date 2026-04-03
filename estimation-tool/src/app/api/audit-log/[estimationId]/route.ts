import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

interface RouteContext {
  params: Promise<{ estimationId: string }>
}

export async function GET(request: Request, { params }: RouteContext) {
  const { estimationId } = await params
  const supabase = await createServerSupabaseClient()

  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50'), 200)
  const offset = parseInt(url.searchParams.get('offset') ?? '0')

  const { data, error, count } = await supabase
    .from('audit_events')
    .select('*', { count: 'exact' })
    .eq('estimation_id', estimationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ events: data, total: count, limit, offset })
}

export async function POST(request: Request, { params }: RouteContext) {
  const { estimationId } = await params
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as {
    event_kind: string
    description: string
    metadata?: Record<string, unknown>
  }

  const { data, error } = await supabase
    .from('audit_events')
    .insert({
      estimation_id: estimationId,
      event_kind: body.event_kind,
      actor_id: user.id,
      actor_name: user.user_metadata?.full_name ?? user.email,
      actor_role: user.user_metadata?.role ?? 'viewer',
      description: body.description,
      metadata: body.metadata,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
