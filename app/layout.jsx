import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { SavedProvider } from '@/components/saved/SavedProvider'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'My World City — Property Platform for Modern Jaipur',
  description:
    "A curated property platform connecting buyers, builders and investors with verified residential, commercial, industrial and agricultural opportunities across Jaipur.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <SavedProvider>{children}</SavedProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
