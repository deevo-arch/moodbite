'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion'
import { placeOrderFromCart, logoutAction } from '@/app/actions'

type MenuItem = {
  id: string; name: string; description: string; price: number; tags: string; imageUrl: string | null;
  restaurant: { id: string; name: string }
}

type OrderData = {
  id: string; status: string; total: number;
  restaurant: { name: string };
  items: { menuItem: { name: string }; quantity: number }[];
}

type CartItem = MenuItem & { quantity: number }

const MOODS = [
  { name: 'Happy', icon: '😊', color: 'bg-[#FFB77D]', img: 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=400&q=80' },
  { name: 'Comfort', icon: '🛋️', color: 'bg-[#00B5FC]', img: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&q=80' },
  { name: 'Energetic', icon: '⚡', color: 'bg-[#FF4D4D]', img: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&q=80' },
  { name: 'Late Night', icon: '🌙', color: 'bg-[#A855F7]', img: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&q=80' },
  { name: 'Celebratory', icon: '🎉', color: 'bg-[#FFD700]', img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80' },
  { name: 'Stressed', icon: '😤', color: 'bg-[#EF4444]', img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80' },
]

const STATUS_PROGRESS: Record<string, number> = { PENDING: 15, PREPARING: 35, READY: 55, ARRIVED: 70, PICKED_UP: 85, DELIVERED: 100 }

export default function UserDashboard({ menuItems, orders: initialOrders, userName, userAvatar }: {
  menuItems: MenuItem[]; orders: OrderData[]; userName: string; userAvatar?: string | null
}) {
  const [orders, setOrders] = useState(initialOrders)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [tab, setTab] = useState<'explore' | 'orders'>('explore')
  const [checkingOut, setCheckingOut] = useState(false)
  
  // Active selected mood from the horizontal sticky scroller
  const [activeMood, setActiveMood] = useState<string | null>(null)

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  // Interactive Background Logic
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const spotlightGradient = useMotionTemplate`
    radial-gradient(800px circle at ${mouseX}px ${mouseY}px, 
    rgba(255, 140, 0, 0.15), 
    transparent 80%)
  `
  
  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const { left, top } = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - left)
    mouseY.set(e.clientY - top)
  }

  // SSE setup
  useEffect(() => {
    const es = new EventSource('/api/events')
    es.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setOrders(prev => {
        const idx = prev.findIndex(o => o.id === data.id)
        if (idx >= 0) { const c = [...prev]; c[idx] = data; return c }
        return [data, ...prev]
      })
    }
    return () => es.close()
  }, [])

  const addToCart = useCallback((item: MenuItem, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCart(prev => {
      const idx = prev.findIndex(c => c.id === item.id)
      if (idx >= 0) { const c = [...prev]; c[idx] = { ...c[idx], quantity: c[idx].quantity + 1 }; return c }
      return [...prev, { ...item, quantity: 1 }]
    })
    setCartOpen(true)
  }, [])

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: Math.max(1, c.quantity + delta) } : c))
  }
  const removeItem = (id: string) => setCart(prev => prev.filter(c => c.id !== id))

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setCheckingOut(true)
    try {
      const items = cart.map(c => ({ menuItemId: c.id, restaurantId: c.restaurant.id, quantity: c.quantity, price: c.price }))
      await placeOrderFromCart(items)
      setCart([])
      setCartOpen(false)
      setTab('orders')
    } catch (e) { console.error(e) }
    setCheckingOut(false)
  }

  const activeOrders = orders.filter(o => o.status !== 'DELIVERED')
  const pastOrders = orders.filter(o => o.status === 'DELIVERED')

  const moodDishes = activeMood ? menuItems.filter(m => m.tags?.toLowerCase().includes(activeMood.toLowerCase())) : []

  return (
    <>
      {/* === TopNavBar (Exact Stitch) === */}
      <nav className="sticky top-0 w-full z-50 bg-[#0e0e0e]/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <div 
            className="h-10 w-10 relative flex items-center justify-center -ml-2"
            style={{ 
              WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 70%)',
              maskImage: 'radial-gradient(circle, black 40%, transparent 70%)' 
            }}
          >
            <img src="/logo.png" alt="MoodBite" className="absolute w-[150%] h-[150%] max-w-none object-contain mix-blend-screen" />
          </div>
          <div className="hidden lg:flex items-center gap-6">
            <button onClick={() => setTab('explore')} className={`font-['Inter'] tracking-tight cursor-pointer transition-colors duration-300 ${tab === 'explore' ? 'text-orange-400 font-bold' : 'text-neutral-400 hover:text-orange-300'}`}>Explore</button>
            <button onClick={() => setTab('orders')} className={`font-['Inter'] tracking-tight cursor-pointer transition-colors duration-300 ${tab === 'orders' ? 'text-orange-400 font-bold' : 'text-neutral-400 hover:text-orange-300'}`}>
              Orders {activeOrders.length > 0 && <span className="ml-1 text-[10px] bg-primary-container text-on-primary-container px-1.5 py-0.5 rounded-full font-bold">{activeOrders.length}</span>}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden xl:flex items-center gap-3">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} referrerPolicy="no-referrer" className="w-9 h-9 rounded-full border border-white/10 shadow-lg object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-lg border border-primary/20">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-medium text-on-surface">Hey, {userName}</span>
          </div>
          <div className="relative cursor-pointer hover:scale-105 transition-transform active:scale-95" onClick={() => setCartOpen(true)}>
            <span className="material-symbols-outlined text-neutral-200 text-2xl">shopping_cart</span>
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-primary-container text-on-primary-container text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">{cartCount}</span>}
          </div>
          <form action={logoutAction}>
            <button type="submit" className="cursor-pointer hover:scale-105 transition-transform active:scale-95 text-neutral-400 hover:text-neutral-200">
              <span className="material-symbols-outlined text-2xl">logout</span>
            </button>
          </form>
        </div>
      </nav>

      {/* === Main Content === */}
      {tab === 'explore' && (
        <main className="bg-[#0e0e0e]">
          
          {/* 1. HERO SECTION */}
          <section 
            id="interactive-hero-bg" 
            className="relative w-full h-[80vh] overflow-hidden flex items-center justify-center bg-black"
            onMouseMove={handleMouseMove}
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <img src="/bg_hero.png" alt="MoodBite Hero Background" className="w-full h-full object-cover opacity-50 mix-blend-screen" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/40 to-[#0e0e0e]/20"></div>
            </div>

            {/* Ambient Glows */}
            <div className="absolute top-[20%] left-[15%] w-[500px] h-[500px] bg-[#FFB77D]/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse"></div>
            <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-[#FF8C00]/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* Interactive Spotlight */}
            <motion.div
              className="pointer-events-none absolute -inset-px opacity-80 mix-blend-screen z-0"
              style={{
                background: spotlightGradient
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent z-0 pointer-events-none"></div>
            <div className="relative z-10 text-center px-6">
              <h1 className="text-white text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight [text-shadow:_0_8px_40px_rgba(0,0,0,1)]">
                What&apos;s your <span className="text-primary-container text-[#FF8C00]">Mood</span> right now?
              </h1>
              <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 [text-shadow:_0_4px_20px_rgba(0,0,0,1)]">
                Discover curated culinary experiences matched perfectly to your vibe. Scroll down to dive in.
              </p>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-white/50 inline-block">
                <span className="material-symbols-outlined text-4xl">keyboard_arrow_down</span>
              </motion.div>
            </div>
          </section>

          {/* 2. STICKY SCROLL ANIMATION: SELECT YOUR VIBE */}
          <VibeSelector activeMood={activeMood} setActiveMood={setActiveMood} menuItems={menuItems} addToCart={addToCart} />

          {/* 3. BROWSE ALL SECTION */}
          <section className="max-w-[1440px] mx-auto px-6 py-24 z-10 relative bg-[#0e0e0e]">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl font-black tracking-tight text-white mb-2">Browse All Collections</h2>
                <p className="text-on-surface-variant text-lg">Just want something specific? Explore the full spectrum.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {menuItems.map((item, index) => (
                <div key={item.id} className="group glass-card rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-white/5 transition-all duration-500">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={item.imageUrl || ''} alt={item.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="text-primary text-[10px] uppercase font-black tracking-widest bg-black/50 px-2 py-1 rounded backdrop-blur-md inline-block mb-1">{item.restaurant.name}</span>
                      <h3 className="text-white font-bold text-xl leading-tight [text-shadow:_0_2px_10px_rgba(0,0,0,1)]">{item.name}</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-on-surface-variant text-sm line-clamp-2 mb-4 h-10">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-white">₹{item.price}</span>
                      <button onClick={() => addToCart(item)} className="bg-primary hover:bg-primary-container text-[#0e0e0e] font-bold px-4 py-2 rounded-full active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                        Add <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </main>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <main className="max-w-[1440px] mx-auto px-6 py-12 pb-32 min-h-screen">
          <section>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-8">Your Orders</h2>
            {activeOrders.length === 0 && pastOrders.length === 0 && (
              <div className="text-center py-20 text-on-surface-variant glass-card rounded-xl">
                <span className="text-5xl block mb-4">📦</span>
                <p className="text-lg">No orders yet. Go explore!</p>
              </div>
            )}
            <div className="space-y-4 max-w-4xl mx-auto">
              {activeOrders.map(order => (
                <div key={order.id} className="glass-card rounded-xl p-6 group hover:bg-surface-container/80 transition-all border border-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-white">{order.restaurant.name}</h4>
                      <p className="text-on-surface-variant text-sm">{order.items.map(i => `${i.quantity}× ${i.menuItem.name}`).join(', ')}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${order.status === 'PENDING' ? 'bg-primary/10 text-primary' : order.status === 'PREPARING' ? 'bg-tertiary/10 text-tertiary' : order.status === 'READY' ? 'bg-green-500/10 text-green-400' : 'bg-secondary/10 text-secondary'}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-primary font-bold">₹{order.total.toFixed(0)}</span>
                    <div className="flex-1 h-1 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary-container rounded-full transition-all duration-1000" style={{ width: `${STATUS_PROGRESS[order.status] || 10}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
              {pastOrders.map(order => (
                <div key={order.id} className="glass-card rounded-xl p-6 opacity-60">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-bold text-white">{order.restaurant.name}</h4>
                      <p className="text-on-surface-variant text-sm">{order.items.map(i => `${i.quantity}× ${i.menuItem.name}`).join(', ')}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-[10px] font-bold uppercase">Delivered</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* Cart Drawer & Mobile Nav hidden below */}
      {/* ... keeping cart drawer ... */}
      <div className={`fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${cartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setCartOpen(false)} />
      <aside className={`fixed top-0 right-0 bottom-0 z-[100] w-[420px] max-w-[90vw] glass-panel border-l border-white/10 flex flex-col transition-transform duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="text-xl font-bold">Your Cart <span className="text-on-surface-variant text-sm font-normal ml-1">({cartCount})</span></h3>
          <button className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-white transition" onClick={() => setCartOpen(false)}>
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
             <span className="text-4xl mb-4 opacity-50 block">🛒</span>
             <p>Your cart is empty.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-3 no-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 items-center p-4 bg-surface-container/50 border border-white/5 rounded-xl">
                  <div className="w-16 h-16 rounded-lg bg-black overflow-hidden flex-shrink-0">
                    <img src={item.imageUrl || ''} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-white truncate">{item.name}</span>
                    <span className="block text-[11px] text-on-surface-variant mt-0.5">{item.restaurant.name}</span>
                    <span className="block text-sm font-black text-primary mt-1">₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center bg-surface-container-high rounded-full overflow-hidden border border-white/5">
                      <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 transition">−</button>
                      <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 transition">+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-white/5 bg-[#0e0e0e]/80 backdrop-blur-xl">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-on-surface-variant"><span>Subtotal</span><span className="text-white">₹{subtotal.toFixed(0)}</span></div>
                <div className="flex justify-between text-sm text-on-surface-variant"><span>Delivery</span><span className="text-green-400 font-bold uppercase tracking-widest text-[10px]">Free</span></div>
                <div className="flex justify-between text-xl font-black pt-2 border-t border-white/5 text-white"><span>Total</span><span>₹{subtotal.toFixed(0)}</span></div>
              </div>
              <button onClick={handleCheckout} disabled={checkingOut} className="w-full py-4 bg-primary hover:bg-primary-container text-[#0e0e0e] font-black rounded-full transition-all shadow-[0_0_20px_rgba(255,140,0,0.3)] disabled:opacity-50">
                {checkingOut ? 'Processing...' : 'Place Order Now'}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}

function VibeSelector({ activeMood, setActiveMood, menuItems, addToCart }: { 
  activeMood: string | null; 
  setActiveMood: (mood: string | null) => void;
  menuItems: MenuItem[];
  addToCart: (item: MenuItem, e?: React.MouseEvent) => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: scrollContainerRef })
  const xTransform = useTransform(scrollYProgress, [0, 1], ["0%", "-80%"])

  const moodDishes = activeMood ? menuItems.filter(m => m.tags?.toLowerCase().includes(activeMood.toLowerCase())) : []

  return (
    <div ref={scrollContainerRef} className="relative h-[400vh] bg-[#0e0e0e] w-full mt-10">
      <div className="sticky top-20 h-[clac(100vh-80px)] overflow-hidden flex items-center bg-[#0e0e0e]">
        <div className="absolute top-10 w-full px-12 md:px-24 z-20">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2">The Vibe Selector</h2>
          <p className="text-on-surface-variant text-lg">Scroll to slide through moods. Click a card to explore dishes.</p>
        </div>

        {/* The horizontally animating strip of cards */}
        <motion.div style={{ x: xTransform }} className="flex gap-8 px-12 md:px-24 pt-32 w-max">
          {MOODS.map(mood => (
            <motion.div key={mood.name} 
              onClick={() => setActiveMood(mood.name === activeMood ? null : mood.name)}
              className={`relative w-[320px] h-[480px] rounded-3xl overflow-hidden cursor-pointer group flex-shrink-0 transition-transform duration-500 will-change-transform ${activeMood === mood.name ? 'scale-105 shadow-[0_0_50px_rgba(255,140,0,0.3)] ring-2 ring-primary' : 'hover:-translate-y-4 hover:shadow-2xl opacity-90 hover:opacity-100'}`}
            >
              <img src={mood.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={mood.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              
              <div className="absolute p-8 bottom-0 w-full">
                <span className="text-5xl block mb-4 filter drop-shadow-xl">{mood.icon}</span>
                <h3 className="text-3xl font-black text-white tracking-tight mb-2 [text-shadow:_0_4px_20px_rgba(0,0,0,1)]">{mood.name}</h3>
                <p className="text-white/80 font-medium text-sm">Find pure {mood.name.toLowerCase()} in every bite.</p>
                
                <div className="mt-6 flex items-center text-primary font-bold text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                  {activeMood === mood.name ? 'Close Menu' : 'View Dishes'} <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Pop-out overlay submenu for the selected mood */}
        <AnimatePresence>
          {activeMood && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="absolute right-0 bottom-10 w-full md:w-[600px] h-[80vh] md:max-h-[600px] mr-12 glass-panel border border-white/10 rounded-3xl z-30 p-8 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <div>
                  <span className="text-primary text-xs uppercase font-black tracking-widest mb-1 block">Curated Menu</span>
                  <h3 className="text-3xl font-black text-white">{activeMood} Bites</h3>
                </div>
                <button onClick={() => setActiveMood(null)} className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-white transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-2">
                {moodDishes.length === 0 ? (
                    <div className="text-center py-20 text-on-surface-variant"><p>No dishes found for this mood yet.</p></div>
                ) : moodDishes.map(dish => (
                  <div key={dish.id} className="bg-surface-container-highest/50 border border-white/5 rounded-2xl p-4 flex gap-4 items-center group hover:bg-surface-container transition-colors cursor-pointer" onClick={() => addToCart(dish)}>
                    <div className="w-20 h-20 rounded-xl bg-black overflow-hidden flex-shrink-0 relative">
                      <img src={dish.imageUrl || ''} alt={dish.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold text-lg leading-tight">{dish.name}</h4>
                      <p className="text-on-surface-variant text-xs line-clamp-1 mb-2">{dish.description}</p>
                      <span className="text-primary font-black">₹{dish.price}</span>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors transform active:scale-90" onClick={(e) => addToCart(dish, e)}>
                      <span className="material-symbols-outlined text-sm font-bold">add</span>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
