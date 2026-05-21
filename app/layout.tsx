import type { Metadata } from 'next'
import Navbar from '@/components/shared/Navbar'
import './globals.css'

export const metadata: Metadata = {
  title: 'AllCar Services — ซื้อขายรถมือสอง หาอู่ซ่อมรถ',
  description: 'Platform รถยนต์ครบวงจร ซื้อขายรถมือสอง หาอู่ซ่อมใกล้บ้าน พร้อมระบบรีวิวที่น่าเชื่อถือ',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AllCar Services',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <Navbar />
        <main>{children}</main>
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
              })
            }
          `
        }} />
      </body>
    </html>
  )
}