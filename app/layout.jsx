import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { SavedProvider } from '@/components/saved/SavedProvider'
import AssistantProvider from '@/components/assistant/AssistantProvider'

// Stolzl (weights 300 / 400 / 500 / 700) comes from an Adobe Fonts web
// project — the same way suntap.in loads it. To move it to your own Adobe
// account, create a web project there with Stolzl and swap the kit id below.
const ADOBE_FONTS_KIT = 'pjg1ebb'

export const metadata = {
  title: 'My World City — Property Platform for Modern Jaipur',
  description:
    "A curated property platform connecting buyers, builders and investors with verified residential, commercial, industrial and agricultural opportunities across Jaipur.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href={`https://use.typekit.net/${ADOBE_FONTS_KIT}.css`} />
      </head>
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
