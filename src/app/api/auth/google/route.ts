import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const host = req.headers.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  
  if (!clientId) {
    return NextResponse.json({ error: 'Missing GOOGLE_CLIENT_ID in .env' }, { status: 500 })
  }

  const redirectUri = `${protocol}://${host}/api/auth/google/callback`
  const scope = 'openid email profile'

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.append('client_id', clientId)
  authUrl.searchParams.append('redirect_uri', redirectUri)
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('scope', scope)

  return NextResponse.redirect(authUrl.toString())
}
