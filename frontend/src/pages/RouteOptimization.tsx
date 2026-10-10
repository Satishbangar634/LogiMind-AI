import { useEffect, useState } from 'react'
import axios from 'axios'

import RouteMap from '../components/RouteMap'


interface Location {
  id: number
  name: string
  city: string
}

interface RouteResult {
  source: Location & {
    latitude: string
    longitude: string
  }

  destination: Location & {
    latitude: string
    longitude: string
  }

  planned_distance_km: number

  estimated_duration_minutes: number

  geometry: {
    type: string
    coordinates: [number, number][]
  }

  optimization: {
    distance_saved_km: number
    time_saved_minutes: number
    recommendation: string
  }
}

const RouteOptimization = () => {
  const [locations, setLocations] = useState<Location[]>([])
  const [sourceId, setSourceId] = useState('')
  const [destinationId, setDestinationId] = useState('')

  const [route, setRoute] = useState<RouteResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem('token')

        const response = await axios.get(
          'http://localhost:5000/api/locations',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        setLocations(response.data.locations)
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            'Failed to load locations'
        )
      }
    }

    fetchLocations()
  }, [])

  const handleOptimize = async () => {
    setError('')
    setRoute(null)

    if (!sourceId || !destinationId) {
      setError(
        'Please select source and destination'
      )
      return
    }

    if (sourceId === destinationId) {
      setError(
        'Source and destination must be different'
      )
      return
    }

    try {
      setLoading(true)

      const token = localStorage.getItem('token')

      const response = await axios.post(
        'http://localhost:5000/api/routes/optimize',
        {
          source_location_id: Number(sourceId),
          destination_location_id: Number(destinationId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setRoute(response.data.route)
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Route optimization failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Route Optimization
          </h1>

          <p className="text-slate-400 mt-1">
            Analyze routes and estimate delivery time
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        {/* Route Selection */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-5">
            Select Route
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Source Location
              </label>

              <select
                value={sourceId}
                onChange={(e) =>
                  setSourceId(e.target.value)
                }
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white"
              >
                <option value="">
                  Select source
                </option>

                {locations.map((location) => (
                  <option
                    key={location.id}
                    value={location.id}
                  >
                    {location.name} - {location.city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Destination Location
              </label>

              <select
                value={destinationId}
                onChange={(e) =>
                  setDestinationId(e.target.value)
                }
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white"
              >
                <option value="">
                  Select destination
                </option>

                {locations.map((location) => (
                  <option
                    key={location.id}
                    value={location.id}
                  >
                    {location.name} - {location.city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleOptimize}
            disabled={loading}
            className="mt-6 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 font-semibold"
          >
            {loading
              ? 'Optimizing...'
              : 'Optimize Route'}
          </button>
        </div>

        {/* Result */}
        {route && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">
              Route Result
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <p className="text-slate-400 text-sm">
                  Route
                </p>

                <h3 className="text-lg font-semibold mt-2">
                  {route.source.city}
                  {' → '}
                  {route.destination.city}
                </h3>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <p className="text-slate-400 text-sm">
                  Distance
                </p>

                <h3 className="text-3xl font-bold mt-2">
                  {route.planned_distance_km} KM
                </h3>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <p className="text-slate-400 text-sm">
                  Estimated Time
                </p>

                <h3 className="text-3xl font-bold mt-2">
                  {route.estimated_duration_minutes} min
                </h3>
              </div>
            </div>

            <div className="mt-5 bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-2">
                Optimization Recommendation
              </h3>

              <p className="text-slate-400">
                {route.optimization.recommendation}
              </p>

              <div className="flex gap-8 mt-5">
                <div>
                  <p className="text-sm text-slate-500">
                    Distance Saved
                  </p>

                  <p className="text-xl font-semibold">
                    {route.optimization.distance_saved_km} KM
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Time Saved
                  </p>

                  <p className="text-xl font-semibold">
                    {route.optimization.time_saved_minutes} min
                  </p>
                </div>
              </div>
            </div>

             <RouteMap source={route.source} destination={route.destination} geometry={route.geometry}/>          </div>
        )}
      
    </div>
  )
}

export default RouteOptimization