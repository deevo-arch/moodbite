'use client'

import { register } from '@/app/actions'
import { useActionState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, null)

  return (
    <>
      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        <img className="w-full h-full object-cover opacity-40" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCk0Qdu1_d5rSxd0SkGdMkLzH_amVqoIF9LtQon3OSaFUTh8cl-gPRX-N4oLUZibFBEYIcejV4ujvLPLj5qWs1yEWoB6un_2BN0mwwGNVrwN4SsLWJ11KJEdLHm9orSuG67ShhaKtU8RHn_EIXsce9BzIeUEDWQkZ9ktos8lmFrHEoBdQaDGfI4L008tfeTqOCfFau72JHal4UhEiZ1TDmVw5d8hO-_OMFGbYDVkcEmegCysfwWNTgMeRc0WKQT8Zrr2lTVjHp0Limj" alt="background" />
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface/80 to-surface"></div>
      </div>

      {/* Top Nav */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-6 max-w-none bg-gradient-to-b from-[#131313] to-transparent">
        <div className="text-2xl font-black text-[#FFB77D] tracking-tighter italic font-headline">MoodBite</div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-[#E2E2E2]/60 hover:text-[#FFB77D] transition-colors duration-300 cursor-pointer">help_outline</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center w-full max-w-md mx-auto px-6 py-12">
        <div className="glass-card rounded-xl p-8 md:p-10 flex flex-col items-center gap-8 w-full">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline leading-tight">Create your account</h1>
            <p className="text-on-surface-variant/80 text-sm font-medium">Join the exclusive culinary circle</p>
          </div>

          {/* Error */}
          {state?.error && (
            <div className="w-full bg-error-container/20 text-error px-4 py-3 rounded-xl text-sm text-center font-medium">
              {state.error}
            </div>
          )}

          {/* Form */}
          <form action={formAction} className="w-full space-y-6">
            {/* Role Selector */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold tracking-widest uppercase text-on-surface-variant/60 px-4">Identify Your Role</label>
              <div className="grid grid-cols-1 gap-2 bg-surface-container-lowest p-2 rounded-xl">
                <label className="relative flex items-center p-3 cursor-pointer group rounded-lg transition-all has-[:checked]:bg-primary-container has-[:checked]:text-on-primary-container has-[:checked]:shadow-lg text-on-surface-variant hover:bg-surface-container-highest/40">
                  <input defaultChecked name="role" value="user" type="radio" className="sr-only" />
                  <span className="material-symbols-outlined mr-3">restaurant</span>
                  <span className="text-sm font-semibold">I want to eat</span>
                </label>
                <label className="relative flex items-center p-3 cursor-pointer group rounded-lg transition-all has-[:checked]:bg-primary-container has-[:checked]:text-on-primary-container has-[:checked]:shadow-lg text-on-surface-variant hover:bg-surface-container-highest/40">
                  <input name="role" value="restaurant" type="radio" className="sr-only" />
                  <span className="material-symbols-outlined mr-3">storefront</span>
                  <span className="text-sm font-medium">I own a restaurant</span>
                </label>
                <label className="relative flex items-center p-3 cursor-pointer group rounded-lg transition-all has-[:checked]:bg-primary-container has-[:checked]:text-on-primary-container has-[:checked]:shadow-lg text-on-surface-variant hover:bg-surface-container-highest/40">
                  <input name="role" value="delivery" type="radio" className="sr-only" />
                  <span className="material-symbols-outlined mr-3">delivery_dining</span>
                  <span className="text-sm font-medium">I want to deliver</span>
                </label>
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors">person</span>
                </div>
                <input name="name" type="text" required className="w-full bg-surface-container-highest text-on-surface rounded-full py-4 pl-14 pr-6 border-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-on-surface-variant/50 text-base" placeholder="Full Name" />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors">email</span>
                </div>
                <input name="email" type="email" required className="w-full bg-surface-container-highest text-on-surface rounded-full py-4 pl-14 pr-6 border-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-on-surface-variant/50 text-base" placeholder="Email Address" />
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors">lock</span>
                </div>
                <input name="password" type="password" required minLength={6} className="w-full bg-surface-container-highest text-on-surface rounded-full py-4 pl-14 pr-6 border-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-on-surface-variant/50 text-base" placeholder="Password" />
              </div>
            </div>

            {/* CTA */}
            <button type="submit" disabled={isPending} className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-extrabold text-lg py-5 rounded-full shadow-2xl shadow-primary-container/20 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-60">
              {isPending ? 'Creating...' : 'Create Account'}
              {!isPending && <span className="material-symbols-outlined">arrow_forward</span>}
            </button>
          </form>

          {/* Footer Link */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-on-surface-variant/60 text-sm">
              Already have an account?{' '}
              <Link href="/" className="text-primary-fixed-dim font-bold hover:underline transition-all">Sign In</Link>
            </p>
          </div>
        </div>

        {/* Privacy Hint */}
        <p className="text-center mt-8 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/40 leading-loose px-8">
          By creating an account, you agree to our <span className="text-on-surface-variant/60">Terms of Service</span> and <span className="text-on-surface-variant/60">Privacy Policy</span>.
        </p>
      </main>

      {/* Decorative Glows */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/10 blur-[120px] rounded-full pointer-events-none"></div>
    </>
  )
}
