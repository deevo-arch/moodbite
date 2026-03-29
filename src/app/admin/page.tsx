import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
  const user = await getAuthUser()
  if (!user || user.role !== 'ADMIN') redirect('/')

  const restaurants = await prisma.user.findMany({ where: { role: 'RESTAURANT' } })
  const drivers = await prisma.user.findMany({ where: { role: 'DELIVERY' } })
  const users = await prisma.user.findMany()
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true } },
      restaurant: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' }
  })

  return <AdminDashboard
    restaurants={JSON.parse(JSON.stringify(restaurants))}
    drivers={JSON.parse(JSON.stringify(drivers))}
    users={JSON.parse(JSON.stringify(users))}
    orders={JSON.parse(JSON.stringify(orders))}
    adminName={user.name}
    adminAvatar={user.avatarUrl}
  />
}
