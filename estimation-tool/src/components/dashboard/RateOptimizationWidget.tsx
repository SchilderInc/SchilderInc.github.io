import ProgressBar from '@/components/ui/ProgressBar'
import { formatCurrency } from '@/lib/calculations'
import type { SavingsPotential } from '@/types'

interface RateOptimizationWidgetProps {
  consultantAHR: number
  internalADR: number
  rateGapPct: number
  savings: SavingsPotential
  /** Highest rate used to normalize bar widths */
  maxRate?: number
}

export default function RateOptimizationWidget({
  consultantAHR,
  internalADR,
  rateGapPct,
  savings,
  maxRate,
}: RateOptimizationWidgetProps) {
  const normMax = maxRate ?? Math.max(consultantAHR, internalADR) * 1.2
  const ahrPct = normMax > 0 ? (consultantAHR / normMax) * 100 : 0
  const adrPct = normMax > 0 ? (internalADR / normMax) * 100 : 0
  const gapDirection = rateGapPct >= 0 ? 'up' : 'down'

  return (
    <section className="bg-surface-container-lowest rounded-md overflow-hidden">
      {/* Header */}
      <div className="p-6 flex justify-between items-center bg-surface-container-low">
        <h2 className="text-sm font-black uppercase tracking-widest text-on-surface flex items-center">
          <span className="material-symbols-outlined mr-2 text-primary text-base" aria-hidden="true">
            payments
          </span>
          Rate Optimization Analysis
        </h2>
        <span className="text-[10px] font-bold text-secondary px-2 py-1 bg-secondary-container rounded">
          AHR / ADR COMP
        </span>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Rate comparison */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase">
              Consultant vs FT Resource
            </h3>
            <span
              className={`text-xs font-black ${gapDirection === 'up' ? 'text-error' : 'text-tertiary'}`}
              aria-label={`Rate gap: ${rateGapPct > 0 ? '+' : ''}${rateGapPct.toFixed(1)}%`}
            >
              {rateGapPct > 0 ? '+' : ''}{rateGapPct.toFixed(1)}% Gap
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex mb-2 items-center justify-between">
                <span className="text-[10px] font-bold text-secondary uppercase">
                  Consultant Avg Hourly (AHR)
                </span>
                <span className="text-xs font-black text-primary">
                  ${consultantAHR.toFixed(2)}
                </span>
              </div>
              <ProgressBar
                value={ahrPct}
                color="primary"
                ariaLabel={`Consultant average hourly rate: $${consultantAHR.toFixed(2)}`}
              />
            </div>

            <div>
              <div className="flex mb-2 items-center justify-between">
                <span className="text-[10px] font-bold text-secondary uppercase">
                  Full-Time Internal Avg (ADR)
                </span>
                <span className="text-xs font-black text-secondary">
                  ${internalADR.toFixed(2)}
                </span>
              </div>
              <ProgressBar
                value={adrPct}
                color="secondary"
                ariaLabel={`Internal average daily rate equivalent: $${internalADR.toFixed(2)}`}
              />
            </div>
          </div>

          <p className="mt-6 text-[11px] text-on-surface-variant leading-relaxed italic">
            * Optimization required in Workstream B to align blended rates with
            corporate feasibility targets.
          </p>
        </div>

        {/* Savings potential */}
        <div className="bg-surface-container-low p-6 rounded-md border-l-2 border-primary">
          <h3 className="text-xs font-bold text-secondary uppercase mb-4">
            Savings Potential
          </h3>
          <dl className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <dt className="text-[11px] font-medium text-on-surface-variant">
                Consolidated Sourcing
              </dt>
              <dd className="text-sm font-black text-tertiary">
                -{formatCurrency(savings.consolidated_sourcing)}
              </dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-[11px] font-medium text-on-surface-variant">
                Rate Renegotiation
              </dt>
              <dd className="text-sm font-black text-tertiary">
                -{formatCurrency(savings.rate_renegotiation)}
              </dd>
            </div>
            <div className="mt-4 pt-4 border-t border-outline-variant flex justify-between items-center">
              <dt className="text-[11px] font-black text-on-surface uppercase">
                Total Opportunity
              </dt>
              <dd className="text-lg font-black text-primary">
                {formatCurrency(savings.total)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
