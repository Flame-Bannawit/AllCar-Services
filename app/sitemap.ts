import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = 'https://all-car-services.vercel.app'

  const { data: cars } = await supabase
    .from('car_listings')
    .select('id, updated_at')
    .eq('status', 'active')

  const { data: garages } = await supabase
    .from('garages')
    .select('id, updated_at')
    .eq('status', 'active')

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/cars`, lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 0.9 },
    { url: `${baseUrl}/garages`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
  ]

  const carPages = (cars || []).map(car => ({
    url: `${baseUrl}/cars/${car.id}`,
    lastModified: new Date(car.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const garagePages = (garages || []).map(garage => ({
    url: `${baseUrl}/garages/${garage.id}`,
    lastModified: new Date(garage.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...carPages, ...garagePages]
}