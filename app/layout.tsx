import type { Metadata } from 'next'
import Navbar from '@/components/shared/Navbar'
import './globals.css'

export const metadata: Metadata = {
  title: 'AllCar Services',
  description: 'Platform รถยนต์ครบวงจร ซื้อขายรถมือสอง หาอู่ซ่อมรถ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className="bg-gray-50 min-h-screen">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}