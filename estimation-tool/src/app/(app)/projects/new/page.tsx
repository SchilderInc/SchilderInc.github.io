import EstimationWizard from '@/components/estimation/EstimationWizard'

export const metadata = { title: 'New Estimation | Architectural Monolith' }

export default function NewEstimationPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-2xl font-black text-on-surface tracking-tighter uppercase">
          New Estimation
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Build a fully costed estimation in five steps.
        </p>
      </div>
      <EstimationWizard />
    </div>
  )
}
