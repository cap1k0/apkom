'use client'

import { useState } from 'react'
import Script from 'next/script'
import { requestMagicLink, signInWithPassword } from '@/lib/auth/actions'

export default function LoginPage() {
  const [mode, setMode] = useState<'magic' | 'password'>('magic')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleMagicLink(formData: FormData) {
    setLoading(true)
    setMessage(null)
    const token = (window as any).turnstile?.getResponse()
    formData.set('turnstileToken', token ?? '')
    const result = await requestMagicLink(formData)
    setLoading(false)
    if (result?.error) setMessage(result.error)
    else setMessage('Check your email for the magic link.')
  }

  async function handlePassword(formData: FormData) {
    setLoading(true)
    setMessage(null)
    const result = await signInWithPassword(formData)
    setLoading(false)
    if (result?.error) setMessage(result.error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />

      <div className="w-full max-w-sm bg-white rounded-xl shadow p-8">
        <h1 className="text-xl font-semibold mb-6 text-center">Sign in</h1>

        <div className="flex mb-6 rounded-lg bg-gray-100 p-1">
          <button
            className={`flex-1 py-2 text-sm rounded-md transition ${
              mode === 'magic' ? 'bg-white shadow font-medium' : 'text-gray-500'
            }`}
            onClick={() => setMode('magic')}
          >
            Magic Link
          </button>
          <button
            className={`flex-1 py-2 text-sm rounded-md transition ${
              mode === 'password' ? 'bg-white shadow font-medium' : 'text-gray-500'
            }`}
            onClick={() => setMode('password')}
          >
            Password
          </button>
        </div>

        {mode === 'magic' ? (
          <form action={handleMagicLink} className="space-y-4">
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        ) : (
          <form action={handlePassword} className="space-y-4">
            <input
              name="identifier"
              required
              placeholder="Email or username"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {message && <p className="mt-4 text-sm text-center text-gray-600">{message}</p>}
      </div>
    </div>
  )
}
