'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { LogoWordmark } from '@/components/ui/Logo'
import { useAuthStore } from '@/lib/store'
import { isValidEmail } from '@/lib/utils'

type Mode = 'signin' | 'signup' | 'reset'

const TABS: { id: Mode; label: string; href: string }[] = [
  { id: 'signin', label: 'Sign In', href: '/login' },
  { id: 'signup', label: 'Sign Up', href: '/signup' },
]

export function AuthCard({ mode }: { mode: Mode }) {
  const router = useRouter()
  const signIn = useAuthStore((s) => s.signIn)
  const signUp = useAuthStore((s) => s.signUp)
  const changePassword = useAuthStore((s) => s.changePassword)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [remember, setRemember] = useState(false)

  const tabs = mode === 'reset' ? [{ id: 'signin' as Mode, label: 'Sign In', href: '/login' }, { id: 'reset' as Mode, label: 'Change Password', href: '/reset-password' }] : TABS

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (mode === 'signin') {
      if (!isValidEmail(email)) return toast.error('Enter a valid email address')
      if (!password) return toast.error('Enter your password')
      signIn(email)
      toast.success('Welcome back!')
      router.push('/home')
      return
    }

    if (mode === 'signup') {
      if (!isValidEmail(email)) return toast.error('Enter a valid email address')
      if (password.length < 6) return toast.error('Password must be at least 6 characters')
      if (password !== confirmPassword) return toast.error('Passwords do not match')
      if (!agreed) return toast.error('Please agree to the Terms & Policies')
      signUp(email)
      toast.success('Account created — welcome to SmartJourney!')
      router.push('/home')
      return
    }

    if (mode === 'reset') {
      if (!currentPassword) return toast.error('Enter your current password')
      if (password.length < 6) return toast.error('New password must be at least 6 characters')
      if (password !== confirmPassword) return toast.error('Passwords do not match')
      changePassword()
      toast.success('Password updated')
      router.push('/login')
    }
  }

  const title = 'Welcome Back'
  const subtitle =
    mode === 'signin' ? 'Sign in to access your account' : mode === 'signup' ? 'Create Your account' : 'Change Your Password Here'

  return (
    <div className="relative w-full max-w-md rounded-3xl border border-white/40 bg-white/85 p-8 shadow-2xl shadow-royal-950/20 backdrop-blur-xl sm:p-10">
      <Link
        href="/"
        className="absolute right-6 top-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>

      <LogoWordmark className="mb-6" textClassName="text-royal-700 uppercase" />

      <h1 className="font-display text-3xl font-bold text-gray-900">{title}</h1>
      <p className="mt-1 text-sm text-gray-500">{subtitle}</p>

      <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={`rounded-lg py-2 text-center text-sm font-semibold transition ${
              tab.id === mode ? 'bg-white text-royal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode !== 'reset' && (
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              className="input"
              placeholder="abc@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        )}

        {mode === 'reset' && (
          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              className="input"
              placeholder="Enter password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="label">{mode === 'reset' ? 'new-Password' : 'Password'}</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input pr-11"
              placeholder={mode === 'signin' ? 'Enter your password' : 'Enter password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mode !== 'signin' && (
          <div>
            <label className="label">re-enter Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        )}

        {mode === 'signin' && (
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-royal-600 focus:ring-royal-500"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <Link href="/reset-password" className="font-medium text-berry-600 hover:text-berry-700">
              Forgot password?
            </Link>
          </div>
        )}

        {mode === 'signup' && (
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-royal-600 focus:ring-royal-500"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            Agree to Terms &amp; Policies
          </label>
        )}

        {mode === 'reset' && (
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-royal-600 focus:ring-royal-500" />
            Remember Me
          </label>
        )}

        <button type="submit" className="btn-gradient w-full py-3.5 text-base">
          {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Change Password'}
        </button>
      </form>

      {mode !== 'reset' && (
        <>
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <button
            type="button"
            onClick={() => {
              signIn('google-user@gmail.com')
              router.push('/home')
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <GoogleIcon className="h-4 w-4" /> Google
          </button>
        </>
      )}
    </div>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  )
}
