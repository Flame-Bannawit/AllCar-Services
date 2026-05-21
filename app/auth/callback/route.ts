import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  console.log('Auth callback called, code:', code ? 'exists' : 'missing')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                sameSite: 'lax',
                secure: true,
                httpOnly: true,
              })
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('Exchange result - error:', error?.message, 'session:', data?.session ? 'exists' : 'missing')

    if (!error) {
      return NextResponse.redirect('https://all-car-services.vercel.app/')
    }

    console.log('Redirecting to login due to error:', error?.message)
  }

  return NextResponse.redirect('https://all-car-services.vercel.app/login?error=auth')
}