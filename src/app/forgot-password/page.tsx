'use client'

import Link from 'next/link'

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="fixed inset-0 z-0 bg-[#0e0e0e] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background"></div>
      </div>

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="glass-panel rounded-xl p-8 md:p-12 border border-white/5 shadow-2xl space-y-10 text-center">
            
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-[#FFB77D] to-[#FF8C00] bg-clip-text text-transparent">
                Reset Password
              </h1>
              <p className="text-on-surface-variant text-sm tracking-wide">
                We'll send you an email with instructions to reset your password.
              </p>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Recovery email dispatched (simulation)"); }}>
              <div className="relative group">
                <div className="absolute z-10 inset-y-0 left-6 flex items-center pointer-events-none text-on-surface-variant/60 group-focus-within:text-primary transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  name="email" type="email" required
                  className="w-full bg-surface-container-highest/30 border-0 rounded-full py-4 pl-14 pr-6 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/30 transition-all duration-300 backdrop-blur-md"
                  placeholder="name@example.com"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-bold rounded-full shadow-lg shadow-primary-container/20 active:scale-95 transition-all duration-200 hover:opacity-90"
              >
                Send Reset Link
              </button>
            </form>

            <div className="pt-6 border-t border-white/5 text-center">
              <Link href="/" className="text-secondary font-semibold hover:text-primary transition-colors text-sm flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Login
              </Link>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
