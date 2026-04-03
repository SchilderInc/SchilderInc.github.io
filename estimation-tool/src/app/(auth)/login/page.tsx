'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signIn } from '@/lib/actions'

export default function LoginPage() {
  const [state, action, isPending] = useActionState(signIn, null)

  return (
    <>
      <h2 className="text-lg font-black text-on-surface mb-1">Sign in</h2>
      <p className="text-xs text-on-surface-variant mb-6">
        Enter your credentials to access your workspace.
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
            htmlFor="email"
            className="block text-[10px] font-extrabold uppercase tracking-widest text-secondary mb-1.5"
          >
            Email address
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
            autoComplete="current-password"
            required
            disabled={isPending}
            className="w-full px-3 py-2.5 text-sm bg-surface-container rounded-md border border-outline-variant text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 signature-gradient text-on-primary text-xs font-black uppercase tracking-widest rounded-md hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-on-surface-variant">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-bold text-primary hover:underline"
        >
          Create one
        </Link>
      </p>
    </>
  )
}
