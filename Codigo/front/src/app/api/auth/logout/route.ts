import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AUTH_COOKIE_CONFIG } from '../../../../lib/constants/auth'

export async function POST() {
  const cookieStore = await cookies()

  // Clear auth cookies
  cookieStore.delete(AUTH_COOKIE_CONFIG.TOKEN)
  cookieStore.delete(AUTH_COOKIE_CONFIG.REFRESH_TOKEN)

  return NextResponse.json({ success: true })
}
