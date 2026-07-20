'use client'

import { useState } from 'react'
import { setUsernameAndPassword } from '@/lib/auth/actions'

export default function SetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await setUsernameAndPassword(formData)
    setLoading(false)
    if (result?.error) setError(result.error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-8">
        <h1 className="text-xl font-semibold mb-2 text-center">Finish setting up</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Choose a username and password so you can sign in without a magic link next time.
        </p>

        <form action={handleSubmit} className="space-y-4">
          <input
            name="username"
            required
            minLength={3}
            placeholder="Username"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Password (min 8 characters)"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-center text-red-600">{error}</p>}
      </div>
    </div>
  )
}
