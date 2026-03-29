import { cookies } from 'next/headers'
import { prisma } from './prisma'

export async function setAuthCookie(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set('userId', userId, { httpOnly: true, path: '/' })
}

export async function getAuthUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) return null
  return await prisma.user.findUnique({ where: { id: userId } })
}

export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete('userId')
}
