'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function verifyTurnstile(token: string) {
  if (!process.env.TURNSTILE_SECRET_KEY) return true

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
    }),
  })
  const data = await res.json()
  return data.success === true
}

export async function requestMagicLink(formData: FormData) {
  const email = formData.get('email') as string
  const turnstileToken = formData.get('turnstileToken') as string

  const captchaOk = await verifyTurnstile(turnstileToken)
  if (!captchaOk) {
    return { error: 'Captcha verification failed' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function setUsernameAndPassword(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { error: pwError } = await supabase.auth.updateUser({ password })
  if (pwError) return { error: pwError.message }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ username, password_set: true })
    .eq('id', user.id)

  if (profileError) return { error: profileError.message }

  redirect('/')
}

export async function signInWithPassword(formData: FormData) {
  const identifier = formData.get('identifier') as string // email or username
  const password = formData.get('password') as string

  const supabase = await createClient()

  let email = identifier
  if (!identifier.includes('@')) {
    const { data } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', identifier)
      .single()
    if (!data?.email) return { error: 'User not found' }
    email = data.email
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  redirect('/')
}
