'use client'

import { useState } from 'react'
import { verifyUserAction, rejectUserAction, logoutAction } from '@/app/actions'

type UserData = { id: string; name: string; email: string; role: string; status: string }
type OrderData = { id: string; status: string; total: number; user: { name: string }; restaurant: { name: string } }

export default function AdminDashboard({
  restaurants, drivers, users, orders, adminName, adminAvatar
}: { restaurants: UserData[]; drivers: UserData[]; users: UserData[]; orders: OrderData[]; adminName: string; adminAvatar?: string | null }) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'analytics'>('dashboard')
  const [rList, setRList] = useState(restaurants)
  const [dList, setDList] = useState(drivers)
  const [busy, setBusy] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const allUsers = [...users, ...restaurants, ...drivers]
  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingR = rList.filter(u => u.status === 'PENDING')
  const pendingD = dList.filter(u => u.status === 'PENDING')

  const handleVerify = async (userId: string) => {
    setBusy(userId)
    await verifyUserAction(userId)
    setRList(prev => prev.map(u => u.id === userId ? { ...u, status: 'VERIFIED' } : u))
    setDList(prev => prev.map(u => u.id === userId ? { ...u, status: 'VERIFIED' } : u))
    setBusy(null)
  }

  const handleReject = async (userId: string) => {
    setBusy(userId)
    await rejectUserAction(userId)
    setRList(prev => prev.filter(u => u.id !== userId))
    setDList(prev => prev.filter(u => u.id !== userId))
    setBusy(null)
  }

  return (
    <div className="bg-background text-on-surface antialiased overflow-x-hidden min-h-screen">
      {/* Navigation Drawer (Exact Stitch) */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden md:flex flex-col bg-[#1F1F1F] rounded-r-[3rem] h-full w-72 shadow-[40px_0_40px_rgba(255,255,255,0.06)]">
        <div className="p-8">
          <span className="text-2xl font-bold bg-gradient-to-r from-[#FFB77D] to-[#FF8C00] bg-clip-text text-transparent">MoodMins</span>
        </div>
        <nav className="flex-1 space-y-2 mt-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-[calc(100%-32px)] flex items-center gap-4 rounded-full px-6 py-3 mx-4 font-medium tracking-[-0.02em] transition-all ${activeTab === 'dashboard' ? 'bg-[#FF8C00] text-[#0E0E0E]' : 'text-[#E2E2E2] hover:bg-[#2A2A2A]'}`}
          >
            <span className="material-symbols-outlined">dashboard</span> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-[calc(100%-32px)] flex items-center gap-4 rounded-full px-6 py-3 mx-4 font-medium tracking-[-0.02em] transition-all ${activeTab === 'users' ? 'bg-[#FF8C00] text-[#0E0E0E]' : 'text-[#E2E2E2] hover:bg-[#2A2A2A]'}`}
          >
            <span className="material-symbols-outlined">group</span> User Management
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-[calc(100%-32px)] flex items-center gap-4 rounded-full px-6 py-3 mx-4 font-medium tracking-[-0.02em] transition-all ${activeTab === 'analytics' ? 'bg-[#FF8C00] text-[#0E0E0E]' : 'text-[#E2E2E2] hover:bg-[#2A2A2A]'}`}
          >
            <span className="material-symbols-outlined">analytics</span> Analytics
          </button>
        </nav>
        <div className="p-8">
          <form action={logoutAction}>
            <button type="submit" className="flex items-center gap-4 text-error px-6 py-3 hover:bg-error-container/10 rounded-full transition-all w-full font-medium">
              <span className="material-symbols-outlined">logout</span> Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-72 min-h-screen pt-12 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2">Control Center</h2>
              <p className="text-on-surface-variant text-lg max-w-2xl">Oversee platform growth, verify new culinary partners, and manage operations.</p>
            </header>

            {/* Stats (Stitch Bento Grid) */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="glass-card p-8 rounded-xl border border-outline-variant/5">
                <span className="material-symbols-outlined text-primary mb-4 block" style={{ fontSize: '32px' }}>restaurant</span>
                <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Restaurants</p>
                <h3 className="text-3xl font-black mt-1">{rList.length}</h3>
              </div>
              <div className="glass-card p-8 rounded-xl border border-outline-variant/5">
                <span className="material-symbols-outlined text-secondary mb-4 block" style={{ fontSize: '32px' }}>delivery_dining</span>
                <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Active Couriers</p>
                <h3 className="text-3xl font-black mt-1">{dList.length}</h3>
              </div>
              <div className="glass-card p-8 rounded-xl border border-outline-variant/5">
                <span className="material-symbols-outlined text-tertiary mb-4 block" style={{ fontSize: '32px' }}>payments</span>
                <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Total Orders</p>
                <h3 className="text-3xl font-black mt-1">{orders.length}</h3>
              </div>
              <div className="glass-card p-8 rounded-xl border border-outline-variant/5">
                <span className="material-symbols-outlined text-error mb-4 block" style={{ fontSize: '32px' }}>verified_user</span>
                <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">Pending Verifications</p>
                <h3 className="text-3xl font-black mt-1">{pendingR.length + pendingD.length}</h3>
                {(pendingR.length + pendingD.length) > 0 && <p className="text-on-surface-variant text-xs mt-2">Requires Action</p>}
              </div>
            </section>

            {/* Verification Lists (2-column Stitch layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Unverified Restaurants */}
              <section>
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">Unverified Restaurants</h3>
                    <p className="text-on-surface-variant text-sm">New culinary partners awaiting review</p>
                  </div>
                  {pendingR.length > 0 && <span className="px-4 py-1.5 bg-surface-container-highest rounded-full text-xs font-bold text-primary">{pendingR.length} PENDING</span>}
                </div>
                <div className="space-y-4">
                  {pendingR.length === 0 && (
                    <div className="glass-card p-8 rounded-lg text-center text-on-surface-variant">
                      <span className="text-3xl block mb-2">✅</span>
                      <p>All restaurants verified!</p>
                    </div>
                  )}
                  {pendingR.map(r => (
                    <div key={r.id} className="group glass-card p-6 rounded-lg flex items-center gap-6 border border-outline-variant/0 hover:border-outline-variant/20 transition-all duration-300">
                      <div className="w-16 h-16 rounded-2xl bg-surface-container-lowest flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-2xl">storefront</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg leading-tight">{r.name}</h4>
                        <p className="text-on-surface-variant text-xs">{r.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button disabled={busy === r.id} onClick={() => handleVerify(r.id)}
                          className="bg-gradient-to-br from-[#FFB77D] to-[#FF8C00] text-[#0E0E0E] px-6 py-2.5 rounded-full text-sm font-bold active:scale-95 transition-transform disabled:opacity-60">
                          Verify
                        </button>
                        <button disabled={busy === r.id} onClick={() => handleReject(r.id)}
                          className="glass-card text-error px-4 py-2.5 rounded-full text-sm font-bold active:scale-95 transition-transform disabled:opacity-60 hover:bg-error-container/10">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Unverified Delivery Partners */}
              <section>
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">Unverified Partners</h3>
                    <p className="text-on-surface-variant text-sm">Background check & vehicle inspection</p>
                  </div>
                  {pendingD.length > 0 && <span className="px-4 py-1.5 bg-surface-container-highest rounded-full text-xs font-bold text-secondary">{pendingD.length} PENDING</span>}
                </div>
                <div className="space-y-4">
                  {pendingD.length === 0 && (
                    <div className="glass-card p-8 rounded-lg text-center text-on-surface-variant">
                      <span className="text-3xl block mb-2">✅</span>
                      <p>All delivery partners verified!</p>
                    </div>
                  )}
                  {pendingD.map(d => (
                    <div key={d.id} className="group glass-card p-6 rounded-lg flex items-center gap-6 border border-outline-variant/0 hover:border-outline-variant/20 transition-all duration-300">
                      <div className="w-16 h-16 rounded-2xl bg-surface-container-lowest flex items-center justify-center">
                        <span className="material-symbols-outlined text-secondary text-2xl">person</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg leading-tight">{d.name}</h4>
                        <p className="text-on-surface-variant text-xs">{d.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button disabled={busy === d.id} onClick={() => handleVerify(d.id)}
                          className="bg-gradient-to-br from-[#FFB77D] to-[#FF8C00] text-[#0E0E0E] px-6 py-2.5 rounded-full text-sm font-bold active:scale-95 transition-transform disabled:opacity-60">
                          Verify
                        </button>
                        <button disabled={busy === d.id} onClick={() => handleReject(d.id)}
                          className="glass-card text-error px-4 py-2.5 rounded-full text-sm font-bold active:scale-95 transition-transform disabled:opacity-60 hover:bg-error-container/10">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Activity Feed (Stitch Table) */}
            <section className="mt-16">
              <h3 className="text-2xl font-bold tracking-tight mb-8">Recent Orders</h3>
              <div className="glass-card rounded-xl overflow-hidden border border-outline-variant/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-high/50 border-b border-outline-variant/10">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Customer</th>
                        <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Restaurant</th>
                        <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Total</th>
                        <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5">
                      {orders.slice(0, 10).map(o => (
                        <tr key={o.id} className="hover:bg-surface-container-highest/20 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold">{o.user.name}</td>
                          <td className="px-6 py-4 text-sm">{o.restaurant.name}</td>
                          <td className="px-6 py-4 text-sm font-bold text-primary">₹{o.total.toFixed(0)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                              o.status === 'DELIVERED' ? 'bg-green-500/10 text-green-400' :
                              o.status === 'PENDING' ? 'bg-primary/10 text-primary' :
                              o.status === 'PREPARING' ? 'bg-tertiary/10 text-tertiary' :
                              'bg-secondary/10 text-secondary'
                            }`}>{o.status.replace('_', ' ')}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2">User Management</h2>
                <p className="text-on-surface-variant text-lg max-w-2xl">Manage roles, statuses, and permissions for all platform participants.</p>
              </div>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-80 bg-surface-container-highest/30 border border-white/5 rounded-full py-3 px-6 pl-12 focus:ring-2 focus:ring-primary/30 transition-all outline-none"
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              </div>
            </header>

            <div className="glass-card rounded-2xl border border-outline-variant/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-high/50 border-b border-outline-variant/10">
                    <tr>
                      <th className="px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest">User</th>
                      <th className="px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Role</th>
                      <th className="px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-surface-container-highest/20 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-on-surface">{u.name}</p>
                              <p className="text-xs text-on-surface-variant">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm font-medium tracking-tight">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            u.role === 'ADMIN' ? 'bg-[#FF8C00]/20 text-[#FF8C00]' :
                            u.role === 'RESTAURANT' ? 'bg-[#00B5FC]/20 text-[#00B5FC]' :
                            u.role === 'DELIVERY' ? 'bg-[#A855F7]/20 text-[#A855F7]' :
                            'bg-neutral-500/20 text-neutral-400'
                          }`}>{u.role}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            u.status === 'VERIFIED' ? 'bg-green-500/10 text-green-400' :
                            u.status === 'PENDING' ? 'bg-primary/20 text-primary' :
                            'bg-error-container/20 text-error'
                          }`}>{u.status}</span>
                        </td>
                        <td className="px-8 py-5">
                          <button className="text-on-surface-variant hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
            <header>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2">Platform Analytics</h2>
              <p className="text-on-surface-variant text-lg">Real-time performance metrics and growth insights.</p>
            </header>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Revenue</p>
                    <h3 className="text-5xl font-black text-primary">₹{orders.reduce((s,o) => s + o.total, 0).toLocaleString()}</h3>
                  </div>
                  <span className="material-symbols-outlined text-4xl text-primary/40">payments</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[70%] rounded-full"></div>
                </div>
                <p className="text-xs text-on-surface-variant/60 font-medium">+14% increase from last month</p>
              </div>

              <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-1">Growth Forecast</p>
                    <h3 className="text-5xl font-black text-[#A855F7]">98.4%</h3>
                  </div>
                  <span className="material-symbols-outlined text-4xl text-[#A855F7]/40">trending_up</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-[#A855F7] w-[98.4%] rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
                </div>
                <p className="text-xs text-on-surface-variant/60 font-medium">Optimal platform scaling efficiency</p>
              </div>

              <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-1">User Satisfaction</p>
                    <h3 className="text-5xl font-black text-[#00B5FC]">4.9/5</h3>
                  </div>
                  <span className="material-symbols-outlined text-4xl text-[#00B5FC]/40">auto_awesome</span>
                </div>
                <div className="flex gap-1 text-[#00B5FC]">
                  {Array.from({length: 5}).map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p className="text-xs text-on-surface-variant/60 font-medium">Based on 12.5k reviews</p>
              </div>
            </div>

            {/* Bento Performance Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-card p-8 rounded-[2rem] border border-white/5">
                <h4 className="text-xl font-bold mb-8 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">leaderboard</span>
                  Top Performing Partners
                </h4>
                <div className="space-y-6">
                  {restaurants.slice(0, 4).map((r, i) => (
                    <div key={r.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-black text-on-surface-variant/30">#0{i+1}</span>
                        <div className="font-bold text-on-surface group-hover:text-primary transition-colors cursor-default">{r.name}</div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs font-black uppercase text-on-surface-variant tracking-wider">Rating</p>
                          <p className="font-bold text-sm">4.8</p>
                        </div>
                        <div className="h-10 w-24 bg-surface-container relative rounded overflow-hidden">
                          <div className="absolute inset-0 bg-primary/20"></div>
                          <div className="absolute inset-y-0 left-0 bg-primary/40" style={{ width: `${80 - i*10}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-8 rounded-[2rem] border border-white/5 bg-gradient-to-br from-primary/5 to-transparent">
                <h4 className="text-xl font-bold mb-8 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">query_stats</span>
                  Operational Health
                </h4>
                <div className="grid grid-cols-2 gap-4 h-64">
                  <div className="bg-surface-container/50 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">Avg Delivery</p>
                    <p className="text-4xl font-black text-primary">24m</p>
                  </div>
                  <div className="bg-surface-container/50 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">Active Jobs</p>
                    <p className="text-4xl font-black text-secondary">152</p>
                  </div>
                  <div className="bg-surface-container/50 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">Order Success</p>
                    <p className="text-4xl font-black text-green-400">99.8%</p>
                  </div>
                  <div className="bg-surface-container/50 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">Server Latency</p>
                    <p className="text-4xl font-black text-orange-400">14ms</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
