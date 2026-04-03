// Resource Planning page — Server Component.
// Shows a headcount timeline and rate card manager for the active estimation.
// Uses seed data until Supabase is connected.

import HeadcountTimeline from '@/components/resource-planning/HeadcountTimeline'
import RateCardManager from '@/components/resource-planning/RateCardManager'
import { SEED_ESTIMATION } from '@/lib/seed'
import type { RateCard } from '@/types'

// Stub rate cards derived from the seed estimation's resource mix.
const SEED_RATE_CARDS: RateCard[] = [
  {
    id: 'rc-1', project_id: 'seed-proj-001',
    role_title: 'Cloud Infrastructure Engineer',
    resource_type: 'consultant', location_tier: 'onshore',
    hourly_rate: 185, effective_from: '2024-01-01',
    vendor_name: 'Accenture', created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rc-2', project_id: 'seed-proj-001',
    role_title: 'Cloud Infrastructure Engineer',
    resource_type: 'consultant', location_tier: 'offshore',
    hourly_rate: 95, effective_from: '2024-01-01',
    vendor_name: 'Wipro', created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rc-3', project_id: 'seed-proj-001',
    role_title: 'Data Engineer',
    resource_type: 'consultant', location_tier: 'offshore',
    hourly_rate: 95, effective_from: '2024-01-01',
    vendor_name: 'Wipro', created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rc-4', project_id: 'seed-proj-001',
    role_title: 'UX Designer',
    resource_type: 'full_time', location_tier: 'onshore',
    hourly_rate: 152, effective_from: '2024-01-01',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rc-5', project_id: 'seed-proj-001',
    role_title: 'DevOps Engineer',
    resource_type: 'consultant', location_tier: 'onshore',
    hourly_rate: 185, effective_from: '2024-01-01',
    vendor_name: 'Accenture', created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rc-6', project_id: 'seed-proj-001',
    role_title: 'Security Analyst',
    resource_type: 'consultant', location_tier: 'offshore',
    hourly_rate: 95, effective_from: '2024-01-01',
    vendor_name: 'Wipro', created_at: '2024-01-01T00:00:00Z',
  },
]

export default async function ResourcePlanningPage() {
  // TODO: replace with real Supabase fetch once auth is configured:
  // const supabase = await createServerSupabaseClient()
  // const { data: estimation } = await supabase.from('estimations').select('*, workstreams(*, resources(*))').eq('status','committed').single()
  // const { data: rateCards }  = await supabase.from('rate_cards').select('*').eq('project_id', estimation.project_id)
  const estimation = SEED_ESTIMATION
  const rateCards  = SEED_RATE_CARDS

  const totalResources = estimation.workstreams.reduce((s, ws) => s + ws.resources.length, 0)

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-on-surface tracking-tighter uppercase">
          Resource Planning
        </h1>
        <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant">
          <span className="material-symbols-outlined text-sm text-secondary" aria-hidden="true">info</span>
          {totalResources} resources · {estimation.workstreams.length} workstreams
        </div>
      </div>

      {/* Headcount Timeline */}
      <section className="bg-surface-container-lowest rounded-md p-6 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-secondary" aria-hidden="true">group</span>
            Headcount Timeline
          </h2>
          <span className="text-[10px] font-bold text-secondary bg-secondary-container px-2 py-1 rounded">
            WEEK-BY-WEEK
          </span>
        </div>
        <HeadcountTimeline estimation={estimation} />
      </section>

      {/* Rate Card Manager */}
      <section className="bg-surface-container-lowest rounded-md p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-secondary" aria-hidden="true">payments</span>
            Rate Card Manager
          </h2>
          <button
            type="button"
            className="px-4 py-2 border border-outline text-on-surface text-[10px] font-black uppercase tracking-widest rounded flex items-center gap-1.5 hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
            Add Rate Card
          </button>
        </div>
        <RateCardManager rateCards={rateCards} />
      </section>
    </div>
  )
}
