'use client'

import { useEffect, useState } from 'react'
import { addMenuItem, editMenuItem, deleteMenuItem, updateOrderStatus, logoutAction } from '@/app/actions'

type MenuItem = { id: string; name: string; description: string; price: number; tags: string; imageUrl: string | null; }

type OrderData = {
  id: string; status: string; total: number; createdAt: string;
  user: { name: string };
  items: { menuItem: { name: string }; quantity: number }[];
}

const FLOW: Record<string, { next: string; label: string }> = {
  PENDING:   { next: 'PREPARING', label: 'Accept & Prepare' },
  PREPARING: { next: 'READY', label: 'Ready for Pickup' },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} mins ago`
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`
}

export default function RestaurantDashboard({
  orders: initial, menuItems: initialMenu, restaurantName, menuCount, restaurantAvatar
}: { orders: OrderData[]; menuItems: MenuItem[]; restaurantName: string; menuCount: number; restaurantAvatar?: string | null }) {
  const [orders, setOrders] = useState(initial)
  const [catalog, setCatalog] = useState(initialMenu)
  const [tab, setTab] = useState<'orders' | 'menu'>('orders')
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    const es = new EventSource('/api/events')
    es.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setOrders(prev => {
        const idx = prev.findIndex(o => o.id === data.id)
        if (idx >= 0) { const c = [...prev]; c[idx] = data; return c }
        if (data.restaurant?.name === restaurantName) return [data, ...prev]
        return prev
      })
    }
    return () => es.close()
  }, [restaurantName])

  const handleStatus = async (orderId: string, newStatus: string) => {
    setBusy(orderId)
    await updateOrderStatus(orderId, newStatus)
    setBusy(null)
  }

  const active = orders.filter(o => ['PENDING', 'PREPARING'].includes(o.status))
  const ready  = orders.filter(o => ['READY', 'ARRIVED', 'PICKED_UP'].includes(o.status))
  const done   = orders.filter(o => o.status === 'DELIVERED')

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex overflow-hidden">
      {/* Sidebar (Exact Stitch) */}
      <aside className="w-72 h-screen flex flex-col justify-between p-8 flex-shrink-0" style={{ background: 'linear-gradient(180deg, #1f1f1f 0%, #0e0e0e 100%)' }}>
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-4">
            {restaurantAvatar ? (
              <img src={restaurantAvatar} alt={restaurantName} referrerPolicy="no-referrer" className="w-10 h-10 rounded-xl object-cover border border-white/10" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/20">
                {restaurantName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <h1 className="text-primary text-xl font-bold tracking-tight line-clamp-1">{restaurantName}</h1>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-medium">Premium Kitchen</p>
            </div>
          </div>
          <nav className="flex flex-col gap-4">
            <div onClick={() => setTab('orders')} className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-colors cursor-pointer ${tab === 'orders' ? 'bg-surface-container-highest text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container font-medium'}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: tab === 'orders' ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
              <p className="text-sm">Orders</p>
            </div>
            <div onClick={() => setTab('menu')} className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-colors cursor-pointer ${tab === 'menu' ? 'bg-surface-container-highest text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container font-medium'}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: tab === 'menu' ? "'FILL' 1" : "'FILL' 0" }}>restaurant_menu</span>
              <p className="text-sm">Menu Catalog</p>
            </div>
          </nav>
        </div>
        <div className="flex flex-col gap-2">
          <form action={logoutAction}>
            <button type="submit" className="flex items-center gap-4 px-5 py-4 rounded-xl text-error hover:bg-error-container/10 transition-colors cursor-pointer w-full">
              <span className="material-symbols-outlined">logout</span>
              <p className="text-sm font-medium">Logout</p>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto bg-surface-container-lowest p-10 relative">
        {tab === 'orders' ? (
          <>
            <header className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-on-surface">Kitchen Command</h2>
                <p className="text-on-surface-variant mt-1">Real-time culinary performance monitoring</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full glass-card flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">notifications</span>
                </div>
              </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="glass-card p-8 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 blur-[60px] rounded-full -mr-16 -mt-16"></div>
                <div className="flex justify-between items-start mb-4">
                  <p className="text-on-surface-variant font-medium">Active Orders</p>
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
                </div>
                <div className="flex items-end gap-3">
                  <p className="text-5xl font-bold tracking-tighter text-on-surface">{active.length}</p>
                </div>
                <div className="mt-6 h-1 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container" style={{ width: `${Math.min(100, active.length * 20)}%` }}></div>
                </div>
              </div>
              <div className="glass-card p-8 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-container/10 blur-[60px] rounded-full -mr-16 -mt-16"></div>
                <div className="flex justify-between items-start mb-4">
                  <p className="text-on-surface-variant font-medium">Ready for Pickup</p>
                  <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <div className="flex items-end gap-3">
                  <p className="text-5xl font-bold tracking-tighter text-on-surface">{ready.length}</p>
                </div>
                <div className="mt-6 h-1 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary-container" style={{ width: `${Math.min(100, ready.length * 25)}%` }}></div>
                </div>
              </div>
              <div className="glass-card p-8 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/10 blur-[60px] rounded-full -mr-16 -mt-16"></div>
                <div className="flex justify-between items-start mb-4">
                  <p className="text-on-surface-variant font-medium">Delivered Today</p>
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>delivery_dining</span>
                </div>
                <div className="flex items-end gap-3">
                  <p className="text-5xl font-bold tracking-tighter text-on-surface">{done.length}</p>
                </div>
                <div className="mt-6 h-1 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-container" style={{ width: `${Math.min(100, done.length * 10)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Incoming Orders */}
            <section>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold tracking-tight text-on-surface">Incoming Orders</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {active.length === 0 && (
                  <div className="glass-card rounded-xl p-12 text-center text-on-surface-variant">
                    <span className="text-4xl block mb-4">☀️</span>
                    <p className="text-lg">No incoming orders right now.</p>
                  </div>
                )}
                {active.map(order => {
                  const flow = FLOW[order.status]
                  const isNew = order.status === 'PENDING'
                  return (
                    <div key={order.id} className="glass-card rounded-xl p-8 flex flex-col md:flex-row gap-8 items-center group hover:bg-surface-container/80 transition-all">
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${isNew ? 'bg-primary-container text-on-primary-container' : 'bg-tertiary-container text-on-tertiary-container'}`}>
                            {isNew ? 'New' : 'Preparing'}
                          </span>
                          <span className="text-on-surface-variant text-sm font-medium">Placed {timeAgo(order.createdAt)}</span>
                        </div>
                        <h4 className="text-2xl font-bold text-on-surface mb-2">{order.user.name}</h4>
                        <p className="text-on-surface-variant text-lg">{order.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ')}</p>
                        <div className="mt-4 flex items-center gap-6">
                          <div className="flex flex-col">
                            <span className="text-on-surface-variant text-[10px] uppercase tracking-wider">Total Amount</span>
                            <span className="text-xl font-bold text-primary">₹{order.total.toFixed(0)}</span>
                          </div>
                        </div>
                      </div>
                      {flow && (
                        <div className="flex flex-col gap-3 w-full md:w-auto">
                          <button disabled={busy === order.id} onClick={() => handleStatus(order.id, flow.next)}
                            className={`w-full md:w-48 py-4 px-6 rounded-full font-bold text-sm tracking-wide transition-all active:scale-95 disabled:opacity-60 ${isNew ? 'bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-[0_10px_30px_-10px_rgba(255,140,0,0.4)] hover:shadow-[0_15px_40px_-10px_rgba(255,140,0,0.6)]' : 'bg-gradient-to-r from-tertiary to-tertiary-container text-on-tertiary shadow-[0_10px_30px_-10px_rgba(0,181,252,0.4)]'}`}>
                            {busy === order.id ? 'Updating...' : flow.label}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Ready orders */}
            {ready.length > 0 && (
              <section className="mt-12">
                <h3 className="text-2xl font-bold tracking-tight text-on-surface mb-6">Ready / Out for Delivery</h3>
                <div className="space-y-4 opacity-60 hover:opacity-100 transition-opacity duration-500">
                  {ready.map(order => (
                    <div key={order.id} className="bg-surface-container rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 border-l-2 border-tertiary">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                          <span className="material-symbols-outlined text-tertiary">check_circle</span>
                        </div>
                        <div>
                          <h4 className="text-white font-bold">{order.user.name}</h4>
                          <p className="text-neutral-500 text-xs">{order.items.map(i => `${i.quantity}× ${i.menuItem.name}`).join(', ')}</p>
                        </div>
                      </div>
                      <span className="text-primary font-bold">₹{order.total.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <MenuCatalog catalog={catalog} setCatalog={setCatalog} />
        )}
      </main>
    </div>
  )
}

function MenuCatalog({ catalog, setCatalog }: { catalog: MenuItem[], setCatalog: React.Dispatch<React.SetStateAction<MenuItem[]>> }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '', price: '', tags: 'food', imageUrl: '' })
  const [loading, setLoading] = useState(false)

  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({ name: item.name, description: item.description, price: String(item.price), tags: item.tags, imageUrl: item.imageUrl || '' })
    } else {
      setEditingItem(null)
      setFormData({ name: '', description: '', price: '', tags: 'food', imageUrl: '' })
    }
    setModalOpen(true)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const dataToSave = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        tags: formData.tags,
        imageUrl: formData.imageUrl || null
      }
      if (editingItem) {
        const updated = await editMenuItem(editingItem.id, dataToSave)
        setCatalog(prev => prev.map(c => c.id === updated.id ? updated : c))
      } else {
        const created = await addMenuItem(dataToSave)
        setCatalog(prev => [...prev, created])
      }
      setModalOpen(false)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dish?')) return
    try {
      await deleteMenuItem(id)
      setCatalog(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white">Menu Gallery</h2>
          <p className="text-on-surface-variant text-lg mt-1 tracking-wide">Managing {catalog.length} Active Culinary Creations</p>
        </div>
        <button onClick={() => handleOpenModal()} className="px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-black font-extrabold rounded-full flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_10px_30px_-10px_rgba(255,140,0,0.5)]">
          <span className="material-symbols-outlined font-bold">add</span>
          Add New Dish
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {catalog.map(item => (
          <div key={item.id} className="group glass-card rounded-3xl overflow-hidden hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] transition-all duration-500 border border-white/5 relative">
            <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleOpenModal(item)} className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-primary hover:text-black transition-colors border border-white/20">
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
              <button onClick={() => handleDelete(item.id)} className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-error flex items-center justify-center hover:bg-error hover:text-white transition-colors border border-white/20">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
            
            <div className="h-56 bg-surface flex items-center justify-center overflow-hidden">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <span className="material-symbols-outlined text-6xl text-surface-container-highest">restaurant</span>
              )}
            </div>
            
            <div className="p-6 bg-surface-container-low/80 backdrop-blur-sm relative">
              <div className="absolute -top-6 right-6 px-4 py-2 bg-gradient-to-r from-primary-fixed to-primary text-black font-black text-lg rounded-xl shadow-lg border border-white/20">
                ₹{item.price.toFixed(0)}
              </div>
              <h3 className="text-xl font-black text-white mb-2 line-clamp-1">{item.name}</h3>
              <p className="text-on-surface-variant text-sm line-clamp-2 h-10 mb-4">{item.description}</p>
              <div className="inline-block px-3 py-1 bg-surface-container-highest rounded-full text-[10px] font-bold uppercase tracking-wider text-on-surface-variant border border-white/5">
                {item.tags}
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-white/10 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl scale-in-center">
            <div className="p-8 border-b border-surface-container">
              <h3 className="text-2xl font-black text-white">{editingItem ? 'Edit Culinary Creation' : 'New Culinary Creation'}</h3>
              <p className="text-on-surface-variant text-sm mt-1">Refine your digital tasting menu.</p>
            </div>
            <div className="p-8 flex flex-col gap-6">
              <div>
                <label className="text-xs uppercase font-bold tracking-widest text-on-surface-variant mb-2 block">Dish Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-container-high text-white p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary border border-transparent transition-all" placeholder="e.g. Midnight Truffle Burger" />
              </div>
              <div className="flex gap-6">
                <div className="flex-1">
                  <label className="text-xs uppercase font-bold tracking-widest text-on-surface-variant mb-2 block">Price (₹)</label>
                  <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-surface-container-high text-white p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary border border-transparent transition-all" placeholder="e.g. 599" />
                </div>
                <div className="flex-1">
                  <label className="text-xs uppercase font-bold tracking-widest text-on-surface-variant mb-2 block">Tags / Mood</label>
                  <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full bg-surface-container-high text-white p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary border border-transparent transition-all" placeholder="e.g. comfort" />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase font-bold tracking-widest text-on-surface-variant mb-2 block">Image URL</label>
                <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-surface-container-high text-white p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary border border-transparent transition-all" placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs uppercase font-bold tracking-widest text-on-surface-variant mb-2 block">Evocative Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-surface-container-high text-white p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary border border-transparent transition-all resize-none" placeholder="Describe the flavors and presentation..."></textarea>
              </div>
            </div>
            <div className="p-6 bg-surface-container flex justify-end gap-4 border-t border-white/5">
              <button onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-full font-bold text-on-surface-variant hover:text-white transition-colors">Cancel</button>
              <button disabled={loading || !formData.name || !formData.price} onClick={handleSave} className="px-8 py-3 bg-primary text-black font-black rounded-full hover:bg-primary-container disabled:opacity-50 transition-colors">
                {loading ? 'Saving...' : 'Save Creation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
