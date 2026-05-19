'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export interface GarageMarker {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  rating_avg: number
  rating_count: number
  services: string[]
}

interface MapViewProps {
  garages: GarageMarker[]
  selected: GarageMarker | null
  onSelect: (garage: GarageMarker) => void
}

function FlyToSelected({ selected }: { selected: GarageMarker | null }) {
  const map = useMap()
  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lng], 15, { duration: 1 })
    }
  }, [selected])
  return null
}

export default function MapView({ garages, selected, onSelect }: MapViewProps) {
  const center: [number, number] = garages.length > 0
    ? [garages[0].lat, garages[0].lng]
    : [13.7563, 100.5018]

  return (
    <div className="rounded-xl overflow-hidden border" style={{ height: '480px' }}>
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToSelected selected={selected} />
        {garages.map(garage => (
          <Marker
            key={garage.id}
            position={[garage.lat, garage.lng]}
            eventHandlers={{ click: () => onSelect(garage) }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{garage.name}</p>
                <p className="text-gray-500 text-xs mt-1">{garage.address}</p>
                <p className="text-xs mt-1">★ {garage.rating_avg.toFixed(1)} ({garage.rating_count} รีวิว)</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}