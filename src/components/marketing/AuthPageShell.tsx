import { Suspense } from 'react'
import { SiteHeader } from './SiteHeader'
import { MountainBackdrop } from './MountainBackdrop'
import { AuthCard } from './AuthCard'

export function AuthPageShell({ mode }: { mode: 'signin' | 'signup' | 'reset' }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <MountainBackdrop className="absolute inset-0 -z-10 h-full w-full" />
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        {/* AuthCard reads ?callbackUrl / ?error via useSearchParams, which
            Next 14 requires to sit under a Suspense boundary. */}
        <Suspense>
          <AuthCard mode={mode} />
        </Suspense>
      </main>
    </div>
  )
}
