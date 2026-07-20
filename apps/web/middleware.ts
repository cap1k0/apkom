import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Public paths: landing page, articles, static legal pages, and auth entry points
const PUBLIC_PATHS = ['/', '/articles', '/privacy-policy', '/terms', '/auth/login', '/auth/callback']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  const isPublic = PUBLIC_PATHS.some((p) => (p === '/' ? path === '/' : path.startsWith(p)))

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (user && !isPublic && path !== '/auth/set-password') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('password_set')
      .eq('id', user.id)
      .single()

    if (profile && !profile.password_set) {
      return NextResponse.redirect(new URL('/auth/set-password', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg)$).*)'],
}
