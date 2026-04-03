'use client'

import { useMemo } from 'react'
import type { Estimation } from '@/types'

interface HeadcountTimelineProps {
  estimation: Estimation
}

const BAR_WIDTH = 14
const BAR_GAP   = 3
const CHART_H   = 200
const AXIS_H    = 28
const LABEL_W   = 32

function buildWeeklyData(estimation: Estimation) {
  const resources = estimation.workstreams.flatMap(ws => ws.resources)
  if (resources.length === 0) return []

  const maxWeek = Math.max(...resources.map(r => r.end_week))
  const weeks: { week: number; onshore: number; offshore: number }[] = []

  for (let w = 0; w <= maxWeek; w++) {
    const active = resources.filter(r => r.start_week <= w && r.end_week >= w)
    weeks.push({
      week:     w,
      onshore:  active.filter(r => r.location_tier !== 'offshore').length,
      offshore: active.filter(r => r.location_tier === 'offshore').length,
    })
  }

  return weeks
}

function monthLabel(weekIndex: number, startDate: string): string {
  const d = new Date(startDate)
  d.setDate(d.getDate() + weekIndex * 7)
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export default function HeadcountTimeline({ estimation }: HeadcountTimelineProps) {
  const weeks = useMemo(() => buildWeeklyData(estimation), [estimation])

  if (weeks.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-on-surface-variant italic">
        No resources assigned yet. Add resources in the estimation wizard.
      </div>
    )
  }

  const peak = Math.max(...weeks.map(w => w.onshore + w.offshore), 1)
  const svgW  = weeks.length * (BAR_WIDTH + BAR_GAP) + LABEL_W + 16
  const svgH  = CHART_H + AXIS_H

  // Y-axis grid lines at 25% intervals
  const gridLines = [0.25, 0.5, 0.75, 1].map(f => ({
    y:     CHART_H - Math.round(CHART_H * f),
    label: Math.round(peak * f),
  }))

  // Show month label every 4 weeks, deduped
  const monthLabels: { x: number; label: string }[] = []
  let lastLabel = ''
  weeks.forEach((w, i) => {
    if (i % 4 === 0) {
      const label = monthLabel(w.week, estimation.start_date)
      if (label !== lastLabel) {
        monthLabels.push({ x: LABEL_W + i * (BAR_WIDTH + BAR_GAP) + BAR_WIDTH / 2, label })
        lastLabel = label
      }
    }
  })

  return (
    <div className="overflow-x-auto">
      <svg
        width={svgW}
        height={svgH}
        className="block"
        role="img"
        aria-label={`Headcount timeline: peak ${peak} FTEs over ${weeks.length} weeks`}
      >
        {/* Y-axis grid */}
        {gridLines.map(gl => (
          <g key={gl.y}>
            <line
              x1={LABEL_W}
              x2={svgW}
              y1={gl.y}
              y2={gl.y}
              stroke="var(--color-outline-variant, #e2bfb0)"
              strokeWidth={0.5}
              strokeDasharray="4 2"
            />
            <text
              x={LABEL_W - 4}
              y={gl.y + 4}
              textAnchor="end"
              fontSize={9}
              fill="var(--color-on-surface-variant, #5a4136)"
              fontFamily="var(--font-manrope, sans-serif)"
              fontWeight={600}
            >
              {gl.label}
            </text>
          </g>
        ))}

        {/* Bars */}
        {weeks.map((w, i) => {
          const x           = LABEL_W + i * (BAR_WIDTH + BAR_GAP)
          const total       = w.onshore + w.offshore
          const totalH      = Math.round((total  / peak) * CHART_H)
          const onshoreH    = Math.round((w.onshore / peak) * CHART_H)
          const offshoreH   = totalH - onshoreH
          const totalY      = CHART_H - totalH

          return (
            <g key={w.week}>
              {/* Offshore (primary/orange) — bottom segment */}
              {offshoreH > 0 && (
                <rect
                  x={x}
                  y={totalY + onshoreH}
                  width={BAR_WIDTH}
                  height={offshoreH}
                  fill="var(--color-primary, #a04100)"
                  rx={1}
                />
              )}
              {/* Onshore (secondary/blue) — top segment */}
              {onshoreH > 0 && (
                <rect
                  x={x}
                  y={totalY}
                  width={BAR_WIDTH}
                  height={onshoreH}
                  fill="var(--color-secondary, #476083)"
                  rx={1}
                />
              )}
            </g>
          )
        })}

        {/* X-axis month labels */}
        {monthLabels.map(ml => (
          <text
            key={ml.x}
            x={ml.x}
            y={CHART_H + 16}
            textAnchor="middle"
            fontSize={8}
            fill="var(--color-on-surface-variant, #5a4136)"
            fontFamily="var(--font-manrope, sans-serif)"
            fontWeight={700}
          >
            {ml.label}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex gap-6 mt-4 ml-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-secondary rounded-sm" />
          <span className="text-[10px] font-bold uppercase text-on-surface-variant">Onshore</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-sm" />
          <span className="text-[10px] font-bold uppercase text-on-surface-variant">Offshore</span>
        </div>
        <div className="ml-auto text-[10px] font-bold text-on-surface-variant">
          Peak: {peak} FTEs
        </div>
      </div>
    </div>
  )
}
