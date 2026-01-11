import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromCode } from '@/lib/youtube'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 })
  }

  try {
    const tokens = await getTokenFromCode(code)

    return NextResponse.json({
      success: true,
      message: 'Successfully authenticated! Save this refresh token to your environment variables:',
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get tokens' },
      { status: 500 }
    )
  }
}
