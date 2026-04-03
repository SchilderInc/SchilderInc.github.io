'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signUp } from '@/lib/actions'

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signUp, null)

  if (state?.message) {
    return (
      <div className="text-center">
        <span
          className="material-symbols-outlined text-4xl text-tertiary mb-4 block"
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden="true"
        >
          mark_email_read
        </span>
        <h2 className="text-base font-black text-on-surface mb-2">Check your email</h2>
        <p className="text-sm text-on-surface-variant mb-6">{state.message}</p>
        <Link
          href="/login"
          className="text-xs font-bold text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-lg font-black text-on-surface mb-1">Create account</h2>
      <p className="text-xs text-on-surface-variant mb-6">
        Start building your first estimation in minutes.
      </p>

      {state?.error && (
        <div
          role="alert"
          className="mb-4 p-3 bg-error-container text-on-error-container text-xs rounded-md font-medium"
        >
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div>
          <label
            htmlFor="full_name"
            className="block text-[10px] font-extrabold uppercase tracking-widest text-secondary mb-1.5"
          >
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
            disabled={isPending}
            className="w-full px-3 py-2.5 text-sm bg-surface-container rounded-md border border-outline-variant text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60"
            placeholder="Jane Smith"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-[10px] font-extrabold uppercase tracking-widest text-secondary mb-1.5"
          >
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isPending}
            className="w-full px-3 py-2.5 text-sm bg-surface-container rounded-md border border-outline-variant text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-[10px] font-extrabold uppercase tracking-widest text-secondary mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            disabled={isPending}
            className="w-full px-3 py-2.5 text-sm bg-surface-container rounded-md border border-outline-variant text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60"
            placeholder="Min. 8 characters"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 signature-gradient text-on-primary text-xs font-black uppercase tracking-widest rounded-md hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-on-surface-variant">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-bold text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  )
}
