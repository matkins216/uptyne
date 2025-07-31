// app/layout.tsx
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { GoogleAnalytics } from '@next/third-parties/google'

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] })

export const metadata: Metadata = {
  title: 'Uptyne',
  description: 'Monitor your websites and get alerts when they go down',
  icons: {
    icon: '/favicon.ico',
  },
  // openGraph: {
  //   title: 'Uptyne',
  //   description: 'Monitor your websites and get alerts when they go down',
  //   url: 'XXXXXXXXXXXXXXXXXXXXXXXXX',
  //   siteName: 'Uptyne',
  //   images: [
  //     {
  //       url: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  //       width: 1200,
  //       height: 630,
  //     },
  //   ],
  //   locale: 'en-US',
  //   type: 'website',
  // },
  
  // metadataBase: new URL('XXXXXXXXXXXXXXXXXXXXXXXXX'),
  // alternates: {
  //   canonical: '/',
  // },
  // robots: {
  //   index: true,
  //   follow: true,
  //   nocache: false,
  //   googleBot: {
  //     index: true,
  //     follow: true,
  //     noimageindex: false,
  //     'max-video-preview': -1,
  //     'max-image-preview': 'large',
  //     'max-snippet': -1,
  //   },
  // },
  // verification: {
  //   google: 'google-site-verification=google-site-verification',
  // },
}
  


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        {children}
        {/* <Toaster position="bottom-right" /> */}
      </body>
      <GoogleAnalytics gaId="G-L5KLGQWQBC" />
    </html>
  )
}