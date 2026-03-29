import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const clientId = process.env.DISCORD_CLIENT_ID
  const host = req.headers.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  
  if (!clientId) {
    return NextResponse.json({ error: 'Missing DISCORD_CLIENT_ID in .env' }, { status: 500 })
  }

  const redirectUri = `${protocol}://${host}/api/auth/discord/callback`
  const scope = 'identify email' // Discord needs identify to access the username and email to access email

  const authUrl = new URL('https://discord.com/api/oauth2/authorize')
  authUrl.searchParams.append('client_id', clientId)
  authUrl.searchParams.append('redirect_uri', redirectUri)
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('scope', scope)

  return NextResponse.redirect(authUrl.toString())
}
