'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createEstimation } from '@/lib/actions'
import StepProjectDetails from './StepProjectDetails'
import StepWorkstreams from './StepWorkstreams'
import StepResources from './StepResources'
import StepGeoMix from './StepGeoMix'
import StepReview from './StepReview'

// ── Wizard state types ────────────────────────────────────────────────────────

export interface WsResource {
  id: string
  workstreamId: string
  roleTitle: string
  resourceType: 'consultant' | 'full_time'
  locationTier: 'onshore' | 'offshore' | 'nearshore'
  hourlyRate: number
  weeklyHours: number
  utilizationPct: number
  startWeek: number
  endWeek: number
}

export interface WsEntry {
  id: string
  name: string
  description: string
  budgetCap: string
}

export interface GeoEntry {
  id: string
  locationName: string
  locationTier: 'onshore' | 'offshore' | 'nearshore'
  percentage: string
  avgHourlyRate: string
}

export interface WizardState {
  projectName: string
  projectDescription: string
  versionLabel: string
  startDate: string
  durationWeeks: number
  workstreams: WsEntry[]
  resources: WsResource[]
  geoLocations: GeoEntry[]
}

const INITIAL_STATE: WizardState = {
  projectName: '',
  projectDescription: '',
  versionLabel: 'V1.0.0-EST',
  startDate: new Date().toISOString().split('T')[0],
  durationWeeks: 52,
  workstreams: [],
  resources: [],
  geoLocations: [
    { id: 'default-onshore', locationName: 'United States (HQ)', locationTier: 'onshore',  percentage: '40', avgHourlyRate: '185' },
    { id: 'default-offshore', locationName: 'India (Bangalore)',  locationTier: 'offshore', percentage: '60', avgHourlyRate: '90'  },
  ],
}

const STEPS = [
  { label: 'Project',      icon: 'folder' },
  { label: 'Workstreams',  icon: 'account_tree' },
  { label: 'Resources',    icon: 'group' },
  { label: 'Geo Mix',      icon: 'public' },
  { label: 'Review',       icon: 'fact_check' },
]

// ── Wizard shell ──────────────────────────────────────────────────────────────

export default function EstimationWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [state, setState] = useState<WizardState>(INITIAL_STATE)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const update = useCallback((patch: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...patch }))
  }, [])

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError(null)

    const result = await createEstimation({
      projectName:        state.projectName,
      projectDescription: state.projectDescription,
      versionLabel:       state.versionLabel,
      startDate:          state.startDate,
      durationWeeks:      state.durationWeeks,
      workstreams: state.workstreams.map(ws => ({
        name:        ws.name,
        description: ws.description,
        budgetCap:   ws.budgetCap ? parseFloat(ws.budgetCap) : null,
        resources:   state.resources
          .filter(r => r.workstreamId === ws.id)
          .map(r => ({
            roleTitle:      r.roleTitle,
            resourceType:   r.resourceType,
            locationTier:   r.locationTier,
            hourlyRate:     r.hourlyRate,
            weeklyHours:    r.weeklyHours,
            utilizationPct: r.utilizationPct,
            startWeek:      r.startWeek,
            endWeek:        r.endWeek,
          })),
      })),
      geoLocations: state.geoLocations.map(g => ({
        locationName:   g.locationName,
        locationTier:   g.locationTier,
        percentage:     parseFloat(g.percentage) || 0,
        avgHourlyRate:  parseFloat(g.avgHourlyRate) || 0,
      })),
    })

    setSubmitting(false)
    if ('error' in result) {
      setSubmitError(result.error)
    } else {
      router.push(`/projects?created=${result.id}`)
    }
  }

  const stepProps = { state, update }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step indicator */}
      <nav aria-label="Wizard steps" className="mb-10">
        <ol className="flex items-center gap-0">
          {STEPS.map((s, i) => {
            const status = i < step ? 'done' : i === step ? 'current' : 'upcoming'
            return (
              <li key={s.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <button
                    type="button"
                    onClick={() => i < step && setStep(i)}
                    disabled={i > step}
                    aria-current={status === 'current' ? 'step' : undefined}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      status === 'done'    ? 'signature-gradient text-white cursor-pointer hover:opacity-80' :
                      status === 'current' ? 'bg-primary text-on-primary' :
                                             'bg-surface-container text-on-surface-variant cursor-default'
                    }`}
                  >
                    {status === 'done' ? (
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">check</span>
                    ) : (
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">{s.icon}</span>
                    )}
                  </button>
                  <span className={`mt-1 text-[9px] font-bold uppercase tracking-widest ${
                    status === 'current' ? 'text-primary' : 'text-on-surface-variant'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mb-5 ${i < step ? 'bg-primary' : 'bg-outline-variant'}`} />
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Step content */}
      <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
        {step === 0 && <StepProjectDetails {...stepProps} />}
        {step === 1 && <StepWorkstreams    {...stepProps} />}
        {step === 2 && <StepResources      {...stepProps} />}
        {step === 3 && <StepGeoMix         {...stepProps} />}
        {step === 4 && (
          <StepReview
            {...stepProps}
            submitting={submitting}
            submitError={submitError}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="px-6 py-2.5 border border-outline text-on-surface text-xs font-black uppercase tracking-widest rounded-md hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-default"
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            className="px-6 py-2.5 signature-gradient text-on-primary text-xs font-black uppercase tracking-widest rounded-md hover:opacity-90 transition-opacity active:scale-95"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 signature-gradient text-on-primary text-xs font-black uppercase tracking-widest rounded-md hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-60"
          >
            {submitting ? 'Creating…' : 'Create Estimation'}
          </button>
        )}
      </div>
    </div>
  )
}
