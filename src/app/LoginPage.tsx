'use client'

import { login } from '@/app/actions'
import { useActionState, useEffect } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <>
      {/* Hero Background */}
      <div className="fixed inset-0 z-0 bg-black overflow-hidden relative">
        <img src="/bg_hero.png" alt="Hero Background" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen fade-in duration-1000" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none"></div>
      </div>

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 md:p-12">
        {/* Login Card */}
        <div className="w-full max-w-md">
          <div className="glass-panel rounded-xl p-8 md:p-12 border border-white/5 shadow-2xl space-y-10">
            {/* Brand */}
            <div className="text-center flex flex-col items-center">
              <div 
                className="relative w-56 h-56 mb-2 flex items-center justify-center -mt-6"
                style={{ 
                  WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 65%)',
                  maskImage: 'radial-gradient(circle, black 40%, transparent 65%)' 
                }}
              >
                <img src="/logo.png" alt="MoodBite" className="absolute w-[150%] h-[150%] max-w-none object-contain mix-blend-screen filter drop-shadow-[0_0_15px_rgba(255,140,0,0.5)]" />
              </div>
              <p className="text-on-surface-variant font-medium tracking-wide text-sm opacity-80 uppercase -mt-4">
                Premium Culinary Catalog
              </p>
            </div>

            {/* Error */}
            {state?.error && (
              <div className="bg-error-container/20 text-error px-4 py-3 rounded-xl text-sm text-center font-medium">
                {state.error}
              </div>
            )}

            {/* Form */}
            <form action={formAction} className="space-y-6">
              <div className="space-y-4">
                {/* Email */}
                <div className="relative group">
                  <div className="absolute z-10 inset-y-0 left-6 flex items-center pointer-events-none text-on-surface-variant/60 group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </div>
                  <input
                    name="email" type="email" required
                    className="w-full bg-surface-container-highest/30 border-0 rounded-full py-4 pl-14 pr-6 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/30 transition-all duration-300 backdrop-blur-md"
                    placeholder="Email address"
                  />
                </div>
                {/* Password */}
                <div className="relative group">
                  <div className="absolute z-10 inset-y-0 left-6 flex items-center pointer-events-none text-on-surface-variant/60 group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <input
                    name="password" type="password" required
                    className="w-full bg-surface-container-highest/30 border-0 rounded-full py-4 pl-14 pr-6 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/30 transition-all duration-300 backdrop-blur-md"
                    placeholder="Password"
                  />
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between px-2">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input type="checkbox" className="h-5 w-5 rounded-md border-0 bg-surface-container-highest/50 text-primary focus:ring-0 focus:ring-offset-0 transition-all" />
                  <span className="text-xs font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold text-secondary-fixed-dim hover:text-secondary transition-colors cursor-pointer">
                  Forgot Password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit" disabled={isPending}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-bold rounded-full shadow-lg shadow-primary-container/20 active:scale-95 transition-all duration-200 hover:opacity-90 disabled:opacity-60"
              >
                {isPending ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Footer Links */}
            <div className="pt-4 border-t border-white/5 text-center">
              <p className="text-on-surface-variant text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-primary font-bold hover:underline underline-offset-4 ml-1">Sign Up</Link>
              </p>
            </div>
          </div>

          {/* Social Login */}
          <div className="mt-8 flex flex-col items-center space-y-6">
            <div className="flex items-center w-full space-x-4">
              <div className="h-[1px] flex-grow bg-white/10"></div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/50 font-bold">Or continue with</span>
              <div className="h-[1px] flex-grow bg-white/10"></div>
            </div>
            <div className="flex space-x-4">
              {/* Google Auth Button wired directly to our custom API route */}
              <a href="/api/auth/google" className="w-14 h-14 rounded-full glass-panel border border-white/5 flex items-center justify-center text-on-surface hover:bg-white/10 active:scale-90 transition-all duration-200 shadow-xl group">
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </a>
              {/* Discord Auth Button */}
              <a href="/api/auth/discord" className="w-14 h-14 rounded-full glass-panel border border-white/5 flex items-center justify-center text-on-surface hover:bg-[#5865F2] hover:text-white hover:border-[#5865F2] active:scale-90 transition-all duration-300 shadow-xl group">
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 127.14 96.36">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77.13,77.13,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.3,46,96.19,53,91.08,65.69,84.69,65.69Z"/>
                </svg>
              </a>
              <button disabled className="w-14 h-14 rounded-full glass-panel border border-white/5 flex items-center justify-center text-on-surface/50 cursor-not-allowed">
                <span className="material-symbols-outlined">ios</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Legal */}
        <footer className="mt-auto pt-12 text-[10px] text-on-surface-variant/30 uppercase tracking-widest text-center">
          © 2026 MoodBite Culinary Systems • Privacy • Terms
        </footer>
      </main>
    </>
  )
}
