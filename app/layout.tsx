// app/layout.tsx
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/ui/Navbar'

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] })

export const metadata: Metadata = {
  title: 'Uptime Monitor',
  description: 'Monitor your websites and get alerts when they go down',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Navbar />
        {children}
        {/* <Toaster position="bottom-right" /> */}
      </body>
    </html>
  )
}