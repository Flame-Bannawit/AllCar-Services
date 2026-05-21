import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    return NextResponse.redirect(
      `https://all-car-services.vercel.app/auth/confirm#code=${code}`
    )
  }

  return NextResponse.redirect('https://all-car-services.vercel.app/login?error=auth')
}