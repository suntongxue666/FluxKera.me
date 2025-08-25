import { UserProvider } from '@/lib/user-context'
import Header from '@/components/Header'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FluxKrea - AI Image Generator',
  description: 'Create stunning images with FLUX.1 Krea AI model',
  icons: {
    icon: 'https://ciwjjfcuhubjydajazkk.supabase.co/storage/v1/object/public/webstie-icon/FluxKrea%20log-120.png',
    shortcut: 'https://ciwjjfcuhubjydajazkk.supabase.co/storage/v1/object/public/webstie-icon/FluxKrea%20log-120.png',
    apple: 'https://ciwjjfcuhubjydajazkk.supabase.co/storage/v1/object/public/webstie-icon/FluxKrea%20log-120.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <Header />
          {children}
        </UserProvider>
      </body>
    </html>
  )
}