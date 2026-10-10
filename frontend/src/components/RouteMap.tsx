import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from 'react-leaflet'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface RouteMapProps {
  source: {
    name: string
    city: string
    latitude: string
    longitude: string
  }

  destination: {
    name: string
    city: string
    latitude: string
    longitude: string
  }

  geometry?: {
    type: string
    coordinates: [number, number][]
  }
}

const sourceIcon = new L.Icon({
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const destinationIcon = new L.Icon({
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const RouteMap = ({
  source,
  destination,
  geometry,
}: RouteMapProps) => {
  const sourcePosition: [number, number] = [
    Number(source.latitude),
    Number(source.longitude),
  ]

  const destinationPosition: [number, number] = [
    Number(destination.latitude),
    Number(destination.longitude),
  ]

  const center: [number, number] = [
    (sourcePosition[0] + destinationPosition[0]) / 2,
    (sourcePosition[1] + destinationPosition[1]) / 2,
  ]

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom={true}
        className="h-[500px] w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={sourcePosition}
          icon={sourceIcon}
        >
          <Popup>
            <strong>{source.name}</strong>
            <br />
            {source.city}
          </Popup>
        </Marker>

        <Marker
          position={destinationPosition}
          icon={destinationIcon}
        >
          <Popup>
            <strong>{destination.name}</strong>
            <br />
            {destination.city}
          </Popup>
        </Marker>

        {geometry && geometry.coordinates.length > 0 && (
  <Polyline
    positions={geometry.coordinates.map(
      ([longitude, latitude]) =>
        [latitude, longitude] as [number, number]
    )}
    pathOptions={{
      weight: 5,
    }}
  />
)}
      </MapContainer>
    </div>
  )
}

export default RouteMap