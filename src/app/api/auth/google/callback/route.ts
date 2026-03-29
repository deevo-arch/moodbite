import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { setAuthCookie } from '@/lib/auth'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/?error=NoCodeProvided', request.url))
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = 'http://localhost:3000/api/auth/google/callback'

  try {
    // 1. Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) throw new Error(tokenData.error_description || 'Token exchange failed')

    // 2. Fetch user information
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    
    const userData = await userResponse.json()
    if (!userResponse.ok) throw new Error('Failed to fetch user info')

    // 3. Find or Create User securely
    let dbUser = await prisma.user.findUnique({ where: { email: userData.email } })
    
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name || 'Google User',
          password: 'OAUTH_NO_PASSWORD',
          role: 'USER',
          status: 'VERIFIED',
          avatarUrl: userData.picture || null
        }
      })
    } else if (userData.picture && userData.picture !== dbUser.avatarUrl) {
      // Update the user's avatar if it was added or changed on Google
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { avatarUrl: userData.picture }
      })
    }

    // 4. Set Session Cookie using the existing auth utility
    await setAuthCookie(dbUser.id)

    // 5. Redirect to User Dashboard
    return NextResponse.redirect(new URL('/user', request.url))
  } catch (error) {
    console.error('Google OAuth Error:', error)
    return NextResponse.redirect(new URL('/?error=OAuthFailed', request.url))
  }
}
