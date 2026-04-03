'use client'

import { useState } from 'react'
import type { RateCard } from '@/types'

interface RateCardManagerProps {
  rateCards: RateCard[]
}

const TIER_LABEL: Record<string, string> = {
  onshore:   'Onshore',
  offshore:  'Offshore',
  nearshore: 'Nearshore',
}

const TYPE_LABEL: Record<string, string> = {
  consultant: 'Consultant',
  full_time:  'Full-time',
}

export default function RateCardManager({ rateCards }: RateCardManagerProps) {
  const [filter, setFilter] = useState<'all' | 'consultant' | 'full_time'>('all')

  const visible = rateCards.filter(
    rc => filter === 'all' || rc.resource_type === filter
  )

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 mb-4" role="tablist" aria-label="Filter rate cards by type">
        {(['all', 'consultant', 'full_time'] as const).map(f => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded transition-colors ${
              filter === f
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {f === 'all' ? 'All' : TYPE_LABEL[f]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-outline-variant rounded-lg">
          <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2 block" aria-hidden="true">
            payments
          </span>
          <p className="text-sm text-on-surface-variant">No rate cards defined yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-outline-variant">
          <table className="w-full text-sm" aria-label="Rate cards">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                {['Role', 'Type', 'Location', 'Rate ($/hr)', 'Vendor', 'Valid From', 'Valid To'].map(h => (
                  <th key={h} scope="col" className="px-4 py-3 text-left text-[9px] font-extrabold uppercase tracking-widest text-secondary">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {visible.map(rc => (
                <tr key={rc.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3 font-medium text-on-surface">{rc.role_title}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      rc.resource_type === 'consultant'
                        ? 'bg-primary-fixed text-on-primary-fixed'
                        : 'bg-secondary-fixed text-on-secondary-fixed'
                    }`}>
                      {TYPE_LABEL[rc.resource_type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{TIER_LABEL[rc.location_tier]}</td>
                  <td className="px-4 py-3 font-black text-primary">${rc.hourly_rate.toFixed(2)}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{rc.vendor_name ?? '—'}</td>
                  <td className="px-4 py-3 text-on-surface-variant text-[11px]">
                    {new Date(rc.effective_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant text-[11px]">
                    {rc.effective_to
                      ? new Date(rc.effective_to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : <span className="text-tertiary font-bold">Active</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
