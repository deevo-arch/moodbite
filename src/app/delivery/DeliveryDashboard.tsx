'use client'

import { useEffect, useState } from 'react'
import { updateOrderStatus, assignDelivery, logoutAction } from '@/app/actions'

type OrderData = {
  id: string; status: string; total: number;
  user: { name: string };
  restaurant: { name: string; address?: string | null };
  items: { menuItem: { name: string }; quantity: number }[];
}

const DELIVERY_FLOW: Record<string, { next: string; label: string }> = {
  ARRIVED:   { next: 'PICKED_UP', label: 'Mark Picked Up' },
  PICKED_UP: { next: 'DELIVERED', label: 'Complete Delivery' },
}

export default function DeliveryDashboard({
  readyOrders: initialReady, myOrders: initialMine, driverName, driverAvatar
}: { readyOrders: OrderData[]; myOrders: OrderData[]; driverName: string; driverAvatar?: string | null }) {
  const [ready, setReady] = useState(initialReady)
  const [mine, setMine] = useState(initialMine)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    const es = new EventSource('/api/events')
    es.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setMine(prev => {
        const idx = prev.findIndex(o => o.id === data.id)
        if (idx >= 0) { const c = [...prev]; c[idx] = data; return c }
        if (data.delivery?.name === driverName) return [data, ...prev]
        return prev
      })
      if (data.status === 'READY' && !data.deliveryId) {
        setReady(prev => prev.find(o => o.id === data.id) ? prev : [data, ...prev])
      } else { setReady(prev => prev.filter(o => o.id !== data.id)) }
    }
    return () => es.close()
  }, [driverName])

  const handleAccept = async (orderId: string) => {
    setBusy(orderId)
    await assignDelivery(orderId)
    setReady(prev => prev.filter(o => o.id !== orderId))
    setBusy(null)
  }

  const handleStatus = async (orderId: string, next: string) => {
    setBusy(orderId)
    await updateOrderStatus(orderId, next)
    setBusy(null)
  }

  const active = mine.filter(o => ['ARRIVED', 'PICKED_UP'].includes(o.status))
  const delivered = mine.filter(o => o.status === 'DELIVERED')

  return (
    <div className="bg-surface selection:bg-primary/30 min-h-screen">
      {/* TopNavBar (Stitch) */}
      <nav className="bg-neutral-900/60 backdrop-blur-xl fixed top-0 w-full z-50 shadow-2xl shadow-black/20">
        <div className="flex justify-between items-center w-full px-8 py-4 mx-auto max-w-7xl">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-black tracking-tighter text-orange-400">MoodBite</span>
            <div className="hidden md:flex gap-6">
              <span className="text-orange-400 border-b-2 border-orange-500 pb-1 font-sans tracking-tight antialiased">Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-neutral-800/40 px-4 py-2 rounded-full">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
              <span className="text-orange-400 font-sans text-sm font-bold uppercase tracking-widest">Delivery</span>
            </div>
            <div className="flex items-center gap-4 border-l border-neutral-800 pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-on-surface">{driverName}</p>
                <p className="text-[10px] text-neutral-500 uppercase tracking-tighter">Elite Courier</p>
              </div>
              <div className="flex-shrink-0">
                {driverAvatar ? (
                  <img src={driverAvatar} alt={driverName} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-orange-400/20 flex items-center justify-center text-orange-400 font-bold border border-orange-400/20 shadow-inner">
                    {driverName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <form action={logoutAction}>
                <button type="submit" className="text-neutral-400 hover:text-white transition-colors">
                  <span className="material-symbols-outlined">logout</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-8 max-w-7xl mx-auto">
        {/* Current Delivery (In Progress) */}
        {active.length > 0 && (
          <section className="mb-12">
            <h2 className="text-[0.75rem] font-bold uppercase tracking-[0.2em] text-secondary mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-secondary rounded-full"></span> In Progress
            </h2>
            {active.map(order => {
              const flow = DELIVERY_FLOW[order.status]
              return (
                <div key={order.id} className="relative overflow-hidden rounded-xl bg-surface-container-high mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent pointer-events-none"></div>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-black tracking-tight text-white mb-1">{order.restaurant.name}</h3>
                        {order.restaurant.address && (
                          <p className="text-neutral-400 text-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">location_on</span> {order.restaurant.address}
                          </p>
                        )}
                      </div>
                      <div className="px-4 py-2 bg-secondary/10 rounded-full">
                        <span className="text-secondary text-xs font-bold">{order.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
                          <span className="material-symbols-outlined text-neutral-400">person</span>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Customer</p>
                          <p className="text-white font-bold">{order.user.name}</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-surface-container-low border-l-4 border-secondary">
                        <p className="text-xs text-neutral-500 mb-2 uppercase font-bold tracking-tighter">Items ({order.items.length})</p>
                        <p className="text-on-surface text-sm font-medium">{order.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ')}</p>
                      </div>
                    </div>
                    {flow && (
                      <button disabled={busy === order.id} onClick={() => handleStatus(order.id, flow.next)}
                        className="w-full py-5 bg-gradient-to-r from-secondary-container to-[#007AFF] text-white rounded-full font-black text-lg shadow-xl shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60">
                        {busy === order.id ? 'Updating...' : flow.label}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </section>
        )}

        {/* Available Pickups (Stitch) */}
        <section className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-[0.75rem] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span> Available Near You
            </h2>
          </div>
          {ready.length === 0 && (
            <div className="glass-card rounded-xl p-12 text-center text-on-surface-variant">
              <span className="text-4xl block mb-4">📡</span>
              <p>No orders ready for pickup right now.</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ready.map(order => (
              <div key={order.id} className="glass-card rounded-xl p-6 flex flex-col justify-between min-h-[320px] relative group overflow-hidden">
                <div>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white leading-tight">{order.restaurant.name}</h3>
                    {order.restaurant.address && <p className="text-neutral-500 text-xs mt-1">{order.restaurant.address}</p>}
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-neutral-400">
                      <span className="material-symbols-outlined text-sm">person</span>
                      <span className="text-xs font-medium">{order.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-400">
                      <span className="material-symbols-outlined text-sm">shopping_bag</span>
                      <span className="text-xs font-medium">{order.items.length} Items</span>
                    </div>
                  </div>
                </div>
                <button disabled={busy === order.id} onClick={() => handleAccept(order.id)}
                  className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary-container rounded-full font-black tracking-wide shadow-lg shadow-primary/10 hover:shadow-primary/30 active:scale-95 transition-all disabled:opacity-60">
                  {busy === order.id ? 'Accepting...' : 'Accept & Go'}
                </button>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
              </div>
            ))}
          </div>
        </section>

        {/* Completed (Stitch) */}
        {delivered.length > 0 && (
          <section>
            <h2 className="text-[0.75rem] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-neutral-600 rounded-full"></span> Completed Deliveries Today
            </h2>
            <div className="space-y-4 opacity-60 hover:opacity-100 transition-opacity duration-500">
              {delivered.map(order => (
                <div key={order.id} className="bg-surface-container rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 border-l-2 border-neutral-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-neutral-500">check_circle</span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{order.restaurant.name}</h4>
                      <p className="text-neutral-500 text-xs">Delivered to {order.user.name}</p>
                    </div>
                  </div>
                  <span className="text-primary-fixed-dim font-bold">₹{order.total.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
