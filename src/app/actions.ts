'use server'

import { prisma } from '@/lib/prisma'
import { setAuthCookie, logoutUser as logout } from '@/lib/auth'
import { eventEmitter } from '@/lib/events'
import { redirect } from 'next/navigation'

// ---- Auth ----

export async function login(_prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Please enter both email and password.' }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.password !== password) {
    return { error: 'Invalid email or password.' }
  }

  await setAuthCookie(user.id);

  if (user.role === 'ADMIN') redirect('/admin')
  if (user.role === 'RESTAURANT') redirect('/restaurant')
  if (user.role === 'DELIVERY') redirect('/delivery')
  redirect('/user')
}

export async function register(_prevState: unknown, formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const roleChoice = formData.get('role') as string

  if (!name || !email || !password) {
    return { error: 'Please fill in all fields.' }
  }

  // Map role choice to DB role
  const roleMap: Record<string, string> = {
    user: 'USER',
    restaurant: 'RESTAURANT',
    delivery: 'DELIVERY',
  }
  const role = roleMap[roleChoice] || 'USER'

  // Check if email in use
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: 'Email is already registered.' }
  }

  // Users are auto-verified. Restaurants & delivery need admin verification.
  const status = role === 'USER' ? 'VERIFIED' : 'PENDING'

  const user = await prisma.user.create({
    data: { name, email, password, role, status }
  })

  await setAuthCookie(user.id)

  if (role === 'ADMIN') redirect('/admin')
  if (role === 'RESTAURANT') redirect('/restaurant')
  if (role === 'DELIVERY') redirect('/delivery')
  redirect('/user')
}

export async function logoutAction() {
  await logout();
  redirect('/')
}

// ---- Orders ----

export async function placeOrderFromCart(items: { menuItemId: string; restaurantId: string; quantity: number; price: number }[]) {
  const { getAuthUser } = await import('@/lib/auth');
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthenticated")

  // Group items by restaurant
  const byRestaurant: Record<string, typeof items> = {}
  for (const item of items) {
    if (!byRestaurant[item.restaurantId]) byRestaurant[item.restaurantId] = []
    byRestaurant[item.restaurantId].push(item)
  }

  const orderIds: string[] = []

  for (const [restaurantId, restaurantItems] of Object.entries(byRestaurant)) {
    const total = restaurantItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        restaurantId,
        total,
        status: 'PENDING',
        items: {
          create: restaurantItems.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity
          }))
        }
      },
      include: { user: true, restaurant: true, items: { include: { menuItem: true } } }
    })
    eventEmitter.emit('order-update', order)
    orderIds.push(order.id)
  }

  return orderIds
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
    include: { user: true, restaurant: true, delivery: true, items: { include: { menuItem: true } } }
  })

  eventEmitter.emit('order-update', order)
  return order.id
}

export async function assignDelivery(orderId: string) {
  const { getAuthUser } = await import('@/lib/auth');
  const deliveryUser = await getAuthUser();
  if (!deliveryUser || deliveryUser.role !== 'DELIVERY') return null;

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { deliveryId: deliveryUser.id, status: 'ARRIVED' },
    include: { user: true, restaurant: true, delivery: true, items: { include: { menuItem: true } } }
  })

  eventEmitter.emit('order-update', order)
  return order.id
}

// ---- Admin ----

export async function verifyUserAction(userId: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: 'VERIFIED' }
  });
  return user;
}

export async function rejectUserAction(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
  return true;
}

// ---- Restaurant Catalog Management ----

export async function addMenuItem(data: { name: string; description: string; price: number; tags: string; imageUrl?: string | null }) {
  const { getAuthUser } = await import('@/lib/auth');
  const restaurant = await getAuthUser();
  if (!restaurant || restaurant.role !== 'RESTAURANT') throw new Error('Unauthorized');

  const item = await prisma.menuItem.create({
    data: {
      ...data,
      restaurantId: restaurant.id,
    }
  });
  return item;
}

export async function editMenuItem(id: string, data: { name: string; description: string; price: number; tags: string; imageUrl?: string | null }) {
  const { getAuthUser } = await import('@/lib/auth');
  const restaurant = await getAuthUser();
  if (!restaurant || restaurant.role !== 'RESTAURANT') throw new Error('Unauthorized');

  // Verify ownership
  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing || existing.restaurantId !== restaurant.id) throw new Error('Unauthorized or Not Found');

  const item = await prisma.menuItem.update({
    where: { id },
    data
  });
  return item;
}

export async function deleteMenuItem(id: string) {
  const { getAuthUser } = await import('@/lib/auth');
  const restaurant = await getAuthUser();
  if (!restaurant || restaurant.role !== 'RESTAURANT') throw new Error('Unauthorized');

  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing || existing.restaurantId !== restaurant.id) throw new Error('Unauthorized or Not Found');

  await prisma.menuItem.delete({ where: { id } });
  return true;
}
