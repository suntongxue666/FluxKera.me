import { UserProvider } from '@/lib/user-context'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FluxKrea - AI Image Generator',
  description: 'Create stunning images with FLUX.1 Krea AI model',
  icons: {
    icon: [
      {
        url: 'https://ciwjjfcuhubjydajazkk.supabase.co/storage/v1/object/public/webstie-icon/FluxKrea%20log-120.png',
        sizes: '120x120',
        type: 'image/png',
      },
      {
        url: 'https://ciwjjfcuhubjydajazkk.supabase.co/storage/v1/object/public/webstie-icon/FluxKrea%20log-120.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: 'https://ciwjjfcuhubjydajazkk.supabase.co/storage/v1/object/public/webstie-icon/FluxKrea%20log-120.png',
        sizes: '16x16',
        type: 'image/png',
      }
    ],
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
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  )
}