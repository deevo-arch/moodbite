import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import DeliveryDashboard from './DeliveryDashboard'

export default async function DeliveryPage() {
  const user = await getAuthUser()
  if (!user || user.role !== 'DELIVERY') redirect('/')

  // Orders ready for pickup (not yet assigned to anyone)
  const readyOrders = await prisma.order.findMany({
    where: { status: 'READY', deliveryId: null },
    include: {
      user: { select: { name: true, address: true } },
      restaurant: { select: { name: true, address: true } },
      items: { include: { menuItem: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' }
  })

  // Orders assigned to this driver
  const myOrders = await prisma.order.findMany({
    where: { deliveryId: user.id },
    include: {
      user: { select: { name: true, address: true } },
      restaurant: { select: { name: true, address: true } },
      items: { include: { menuItem: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' }
  })

  return <DeliveryDashboard
    readyOrders={JSON.parse(JSON.stringify(readyOrders))}
    myOrders={JSON.parse(JSON.stringify(myOrders))}
    driverName={user.name}
    driverAvatar={user.avatarUrl}
  />
}
