// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => req.cookies.get(key)?.value,
        set: (key, value, options) => res.cookies.set(key, value, options),
        remove: (key, options) => res.cookies.set(key, '', { ...options, maxAge: -1 }),
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  console.log('📡 Middleware session:', session)

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
