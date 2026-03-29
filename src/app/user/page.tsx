import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import UserDashboard from './UserDashboard'

export default async function UserPage() {
  const user = await getAuthUser()
  if (!user || user.role !== 'USER') redirect('/')

  // Fetch menu items with restaurant info
  const menuItems = await prisma.menuItem.findMany({
    include: { restaurant: { select: { id: true, name: true, rating: true, address: true } } }
  })

  // User's orders
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      restaurant: { select: { name: true } },
      items: { include: { menuItem: { select: { name: true } } } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <UserDashboard menuItems={menuItems} orders={orders} userName={user.name} userAvatar={user.avatarUrl} />
    </div>
  )}
