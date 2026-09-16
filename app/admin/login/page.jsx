'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import AdminLoginForm from '@/components/auth/AdminLoginForm'

// Standalone admin sign-in. The same form also lives behind the "Admin" tab
// of the site's Login button; this page exists for direct links/bookmarks and
// for anyone who reaches /admin without a session.
export default function AdminLoginPage() {
  const { user, loading, refresh } = useAuth()
  const router = useRouter()

  // Already an admin? Straight in.
  useEffect(() => {
    if (!loading && user?.roles?.includes('admin')) router.replace('/admin')
  }, [loading, user, router])

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f6fb] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link href="/" aria-label="My World City — home">
            <Image src="/logo.png" alt="My World City" width={180} height={70} priority className="h-14 w-auto" />
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-card sm:p-8">
          <AdminLoginForm
            onDone={async () => {
              await refresh()
              router.replace('/admin')
            }}
          />
          <p className="mt-6 text-center text-[12.5px] text-slate-400">
            Not an admin?{' '}
            <Link href="/login" className="font-semibold text-brand hover:underline">Go to the normal login</Link>
          </p>
        </div>

        <p className="mt-5 text-center text-[13px] text-slate-500">
          <Link href="/" className="font-semibold text-slate-600 hover:text-navy-800">← Back to site</Link>
        </p>
      </div>
    </main>
  )
}
