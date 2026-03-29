import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LoginPage from './LoginPage'

export default async function Home() {
  const user = await getAuthUser()
  if (user) {
    if (user.role === 'ADMIN') redirect('/admin')
    if (user.role === 'RESTAURANT') redirect('/restaurant')
    if (user.role === 'DELIVERY') redirect('/delivery')
    redirect('/user')
  }

  return <LoginPage />
}
