import { useEffect, useState } from 'react'
import axios from 'axios'

type Location = {
  id: number
  name: string
  city: string
  latitude: number
  longitude: number
}

type Vehicle = {
  id: number
  vehicle_number: string
  vehicle_type: string
  capacity_kg: number
}

type ScenarioResult = {
  vehicle: Vehicle
  quantity_kg: number
  vehicle_utilization_percent: number
  route: {
    distance_km: number
    duration_minutes: number
  }
}

const API_URL = 'http://localhost:5000'

function ScenarioComparison() {
  const [locations, setLocations] = useState<Location[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  const [sourceId, setSourceId] = useState('')
  const [destinationId, setDestinationId] = useState('')

  const [vehicleA, setVehicleA] = useState('')
  const [quantityA, setQuantityA] = useState('')

  const [vehicleB, setVehicleB] = useState('')
  const [quantityB, setQuantityB] = useState('')

  const [resultA, setResultA] =
    useState<ScenarioResult | null>(null)

  const [resultB, setResultB] =
    useState<ScenarioResult | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')

    const loadData = async () => {
      try {
        const [locationsResponse, vehiclesResponse] =
          await Promise.all([
            axios.get(`${API_URL}/api/locations`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),

            axios.get(`${API_URL}/api/vehicles`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ])

        setLocations(
          locationsResponse.data.locations || []
        )

        setVehicles(
          vehiclesResponse.data.vehicles || []
        )
      } catch (error) {
        console.error(error)

        setError(
          'Locations किंवा Vehicles load झाले नाहीत'
        )
      }
    }

    loadData()
  }, [])

  const simulateScenario = async (
    vehicleId: string,
    quantity: string
  ) => {
    const token = localStorage.getItem('token')

    const response = await axios.post(
      `${API_URL}/api/simulation/simulate`,
      {
        source_location_id: Number(sourceId),
        destination_location_id: Number(destinationId),
        vehicle_id: Number(vehicleId),
        quantity_kg: Number(quantity),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    return response.data.simulation
  }

  const handleCompare = async () => {
    setError('')
    setResultA(null)
    setResultB(null)

    if (
      !sourceId ||
      !destinationId ||
      !vehicleA ||
      !quantityA ||
      !vehicleB ||
      !quantityB
    ) {
      setError('कृपया सर्व fields भरा')
      return
    }

    if (sourceId === destinationId) {
      setError(
        'Source आणि Destination same असू शकत नाहीत'
      )
      return
    }

    if (
      Number(quantityA) <= 0 ||
      Number(quantityB) <= 0
    ) {
      setError(
        'Quantity 0 पेक्षा जास्त असावी'
      )
      return
    }

    try {
      setLoading(true)

      const [scenarioA, scenarioB] =
        await Promise.all([
          simulateScenario(vehicleA, quantityA),
          simulateScenario(vehicleB, quantityB),
        ])

      setResultA(scenarioA)
      setResultB(scenarioB)
    } catch (error: any) {
      console.error(error)

      setError(
        error.response?.data?.message ||
          'Scenario comparison failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900">

      {/* Main Content */}
      <main className="min-h-screen w-full p-6 lg:p-8">

        <div className="w-full">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">
              Scenario Comparison
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Compare two logistics scenarios before
              selecting a vehicle and load plan.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Common Route */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="mb-5 text-lg font-semibold text-slate-900">
              Route
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* Source */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Source Warehouse
                </label>

                <select
                  value={sourceId}
                  onChange={(e) =>
                    setSourceId(e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select Source
                  </option>

                  {locations.map((location) => (
                    <option
                      key={location.id}
                      value={location.id}
                    >
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Destination
                </label>

                <select
                  value={destinationId}
                  onChange={(e) =>
                    setDestinationId(e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select Destination
                  </option>

                  {locations
                    .filter(
                      (location) =>
                        location.id !== Number(sourceId)
                    )
                    .map((location) => (
                      <option
                        key={location.id}
                        value={location.id}
                      >
                        {location.name}
                      </option>
                    ))}
                </select>
              </div>

            </div>
          </div>

          {/* Scenarios */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* Scenario A */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Scenario A
                </h2>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  Option A
                </span>
              </div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Vehicle
              </label>

              <select
                value={vehicleA}
                onChange={(e) =>
                  setVehicleA(e.target.value)
                }
                className="mb-5 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Select Vehicle
                </option>

                {vehicles.map((vehicle) => (
                  <option
                    key={vehicle.id}
                    value={vehicle.id}
                  >
                    {vehicle.vehicle_number} -{' '}
                    {vehicle.vehicle_type}
                  </option>
                ))}
              </select>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Quantity (KG)
              </label>

              <input
                type="number"
                min="1"
                value={quantityA}
                onChange={(e) =>
                  setQuantityA(e.target.value)
                }
                placeholder="Enter quantity"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Scenario B */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Scenario B
                </h2>

                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                  Option B
                </span>
              </div>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Vehicle
              </label>

              <select
                value={vehicleB}
                onChange={(e) =>
                  setVehicleB(e.target.value)
                }
                className="mb-5 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              >
                <option value="">
                  Select Vehicle
                </option>

                {vehicles.map((vehicle) => (
                  <option
                    key={vehicle.id}
                    value={vehicle.id}
                  >
                    {vehicle.vehicle_number} -{' '}
                    {vehicle.vehicle_type}
                  </option>
                ))}
              </select>

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Quantity (KG)
              </label>

              <input
                type="number"
                min="1"
                value={quantityB}
                onChange={(e) =>
                  setQuantityB(e.target.value)
                }
                placeholder="Enter quantity"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>

          </div>

          {/* Compare Button */}
          <div className="mt-6">
            <button
              onClick={handleCompare}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-7 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? 'Comparing...'
                : 'Compare Scenarios'}
            </button>
          </div>

          {/* Comparison Result */}
          {resultA && resultB && (
            <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  Scenario Comparison Result
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">

                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                        Metric
                      </th>

                      <th className="px-6 py-4 text-sm font-semibold text-blue-600">
                        Scenario A
                      </th>

                      <th className="px-6 py-4 text-sm font-semibold text-purple-600">
                        Scenario B
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    <tr className="border-t border-slate-200">
                      <td className="px-6 py-4 text-slate-700">
                        Vehicle
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-900">
                        {resultA.vehicle.vehicle_number}
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-900">
                        {resultB.vehicle.vehicle_number}
                      </td>
                    </tr>

                    <tr className="border-t border-slate-200">
                      <td className="px-6 py-4 text-slate-700">
                        Quantity
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {resultA.quantity_kg} KG
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {resultB.quantity_kg} KG
                      </td>
                    </tr>

                    <tr className="border-t border-slate-200">
                      <td className="px-6 py-4 text-slate-700">
                        Vehicle Capacity
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {resultA.vehicle.capacity_kg} KG
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {resultB.vehicle.capacity_kg} KG
                      </td>
                    </tr>

                    <tr className="border-t border-slate-200">
                      <td className="px-6 py-4 text-slate-700">
                        Utilization
                      </td>

                      <td className="px-6 py-4 font-semibold text-blue-600">
                        {resultA.vehicle_utilization_percent}%
                      </td>

                      <td className="px-6 py-4 font-semibold text-purple-600">
                        {resultB.vehicle_utilization_percent}%
                      </td>
                    </tr>

                    <tr className="border-t border-slate-200">
                      <td className="px-6 py-4 text-slate-700">
                        Distance
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {resultA.route.distance_km} KM
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {resultB.route.distance_km} KM
                      </td>
                    </tr>

                    <tr className="border-t border-slate-200">
                      <td className="px-6 py-4 text-slate-700">
                        Estimated Duration
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {resultA.route.duration_minutes} min
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {resultB.route.duration_minutes} min
                      </td>
                    </tr>

                  </tbody>

                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

export default ScenarioComparison