import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: car } = await supabase
    .from('car_listings')
    .select('title, brand, model, year, price, province, images')
    .eq('id', id)
    .single()

  if (!car) return { title: 'ไม่พบรถ — AllCar Services' }

  return {
    title: `${car.title} — AllCar Services`,
    description: `${car.brand} ${car.model} ปี ${car.year} ราคา ฿${car.price.toLocaleString()} จังหวัด${car.province}`,
    openGraph: {
      title: car.title,
      description: `${car.brand} ${car.model} ปี ${car.year} ราคา ฿${car.price.toLocaleString()}`,
      images: car.images?.[0] ? [{ url: car.images[0] }] : [],
    },
  }
}

export default function CarDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}