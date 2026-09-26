import { Inter, Syne } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { SavedProvider } from '@/components/saved/SavedProvider'
import AssistantProvider from '@/components/assistant/AssistantProvider'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
})

// Display face for every heading on the site.
const display = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata = {
  title: 'My World City — Property Platform for Modern Jaipur',
  description:
    "A curated property platform connecting buyers, builders and investors with verified residential, commercial, industrial and agricultural opportunities across Jaipur.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <SavedProvider>
            <AssistantProvider>{children}</AssistantProvider>
          </SavedProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
