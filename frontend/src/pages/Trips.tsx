import { useEffect, useState } from 'react'
import axios from 'axios'


interface Trip {
  id: number
  trip_number: string
  order_id: number
  vehicle_id: number
  source_location_id: number
  destination_location_id: number
  planned_distance_km: string
  estimated_duration_minutes: number
  status: string
  started_at: string | null
  completed_at: string | null
  order_number: string
  commodity: string
  quantity_kg: string
  vehicle_number: string
  driver_name: string
  source_location_name: string
  destination_location_name: string
}

const Trips = () => {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTrips = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('token')

      const response = await axios.get(
        'http://localhost:5000/api/trips',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setTrips(response.data.trips)
    } catch (error: any) {
      console.error('Trips error:', error)

      setError(
        error.response?.data?.message ||
          'Failed to load trips'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrips()
  }, [])

  const updateStatus = async (
    id: number,
    status: string
  ) => {
    try {
      setError('')

      const token = localStorage.getItem('token')

      await axios.patch(
        `http://localhost:5000/api/trips/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      await fetchTrips()
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Failed to update trip status'
      )
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
     
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Trips
          </h1>

          <p className="text-slate-400 mt-1">
            Monitor routes, vehicles and trip status
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">
              Loading trips...
            </div>
          ) : trips.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No trips found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Trip
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Order
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Route
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Vehicle
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Distance
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      ETA
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {trips.map((trip) => (
                    <tr
                      key={trip.id}
                      className="border-t border-slate-800 hover:bg-slate-800/50"
                    >
                      {/* Trip */}
                      <td className="px-5 py-4">
                        <div className="font-medium">
                          {trip.trip_number}
                        </div>

                        <div className="text-xs text-slate-500 mt-1">
                          ID: {trip.id}
                        </div>
                      </td>

                      {/* Order */}
                      <td className="px-5 py-4">
                        <div className="font-medium">
                          {trip.order_number}
                        </div>

                        <div className="text-xs text-slate-400 mt-1">
                          {trip.commodity} ·{' '}
                          {trip.quantity_kg} KG
                        </div>
                      </td>

                      {/* Route */}
                      <td className="px-5 py-4">
                        <div className="text-sm">
                          {trip.source_location_name}
                        </div>

                        <div className="text-xs text-slate-500 my-1">
                          ↓
                        </div>

                        <div className="text-sm">
                          {trip.destination_location_name}
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td className="px-5 py-4">
                        <div className="font-medium">
                          {trip.vehicle_number}
                        </div>

                        <div className="text-xs text-slate-400 mt-1">
                          {trip.driver_name}
                        </div>
                      </td>

                      {/* Distance */}
                      <td className="px-5 py-4">
                        {trip.planned_distance_km} KM
                      </td>

                      {/* ETA */}
                      <td className="px-5 py-4">
                        {trip.estimated_duration_minutes}{' '}
                        min
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <select
                          value={trip.status}
                          onChange={(e) =>
                            updateStatus(
                              trip.id,
                              e.target.value
                            )
                          }
                          className={`px-3 py-2 rounded-lg text-sm border outline-none ${
                            trip.status === 'completed'
                              ? 'bg-green-500/10 border-green-500/30 text-green-400'
                              : trip.status === 'in_progress'
                              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                              : trip.status === 'cancelled'
                              ? 'bg-red-500/10 border-red-500/30 text-red-400'
                              : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                          }`}
                        >
                          <option value="planned">
                            Planned
                          </option>

                          <option value="in_progress">
                            In Progress
                          </option>

                          <option value="completed">
                            Completed
                          </option>

                          <option value="cancelled">
                            Cancelled
                          </option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      
    </div>
  )
}

export default Trips