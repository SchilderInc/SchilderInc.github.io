import ProgressBar from '@/components/ui/ProgressBar'
import { formatCurrency } from '@/lib/calculations'
import type { WorkstreamSummary } from '@/types'

interface WorkstreamAllocationProps {
  workstreams: WorkstreamSummary[]
}

export default function WorkstreamAllocation({ workstreams }: WorkstreamAllocationProps) {
  return (
    <section className="bg-surface-container-lowest p-6 rounded-md shadow-sm">
      <h2 className="text-xs font-black uppercase tracking-widest text-on-surface mb-6">
        Workstream Allocation
      </h2>

      {workstreams.length === 0 ? (
        <p className="text-sm text-on-surface-variant italic">No workstreams defined.</p>
      ) : (
        <ul className="space-y-6" aria-label="Workstream cost breakdown">
          {workstreams.map(ws => (
            <li key={ws.id}>
              <div className="flex justify-between mb-2">
                <span className="text-[11px] font-bold text-on-surface">{ws.name}</span>
                <span className="text-[11px] font-black text-on-surface">
                  {formatCurrency(ws.cost)}
                </span>
              </div>
              <ProgressBar
                value={ws.pct_of_total}
                color="secondary"
                ariaLabel={`${ws.name}: ${formatCurrency(ws.cost)}, ${ws.pct_of_total.toFixed(0)}% of total`}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
