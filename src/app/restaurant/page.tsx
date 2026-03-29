import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import RestaurantDashboard from './RestaurantDashboard'

export default async function RestaurantPage() {
  const user = await getAuthUser()
  if (!user || user.role !== 'RESTAURANT') redirect('/')

  const orders = await prisma.order.findMany({
    where: { restaurantId: user.id },
    include: {
      user: { select: { name: true } },
      items: { include: { menuItem: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' }
  })

  const menuCount = await prisma.menuItem.count({ where: { restaurantId: user.id } })

  const menuItems = await prisma.menuItem.findMany({
    where: { restaurantId: user.id },
    orderBy: { name: 'asc' }
  })

  return <RestaurantDashboard
    orders={JSON.parse(JSON.stringify(orders))}
    menuItems={JSON.parse(JSON.stringify(menuItems))}
    restaurantName={user.name}
    restaurantAvatar={user.avatarUrl}
    menuCount={menuCount}
  />
}
