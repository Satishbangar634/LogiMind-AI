import { useEffect, useState } from 'react'
import axios from 'axios'
import RouteMap from '../components/RouteMap'

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

type Simulation = {
  source: string
  destination: string
  vehicle: Vehicle
  quantity_kg: number
  vehicle_utilization_percent: number
  route: {
    distance_km: number
    duration_minutes: number
    geometry: {
      coordinates: [number, number][]
    }
  }
}

const API_URL = 'http://localhost:5000'

function WhatIfSimulation() {
  const [locations, setLocations] = useState<Location[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  const [sourceId, setSourceId] = useState('')
  const [destinationId, setDestinationId] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [quantity, setQuantity] = useState('')

  const [simulation, setSimulation] =
    useState<Simulation | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')

    const fetchData = async () => {
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

        setLocations(locationsResponse.data.locations || [])
        setVehicles(vehiclesResponse.data.vehicles || [])
      } catch (err) {
        console.error(err)
        setError('Failed to load locations or vehicles')
      }
    }

    fetchData()
  }, [])

  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle.id === Number(vehicleId)
  )

  const handleSimulate = async () => {
    setError('')
    setSimulation(null)

    if (
      !sourceId ||
      !destinationId ||
      !vehicleId ||
      !quantity
    ) {
      setError('Please fill all fields')
      return
    }

    if (sourceId === destinationId) {
      setError('Source and destination cannot be the same')
      return
    }

    const quantityValue = Number(quantity)

    if (quantityValue <= 0) {
      setError('Quantity must be greater than 0')
      return
    }

    if (
      selectedVehicle &&
      quantityValue > Number(selectedVehicle.capacity_kg)
    ) {
      setError(
        `Quantity exceeds vehicle capacity of ${selectedVehicle.capacity_kg} KG`
      )
      return
    }

    try {
      setLoading(true)

      const token = localStorage.getItem('token')

      const response = await axios.post(
        `${API_URL}/api/simulation/simulate`,
        {
          source_location_id: Number(sourceId),
          destination_location_id: Number(destinationId),
          vehicle_id: Number(vehicleId),
          quantity_kg: quantityValue,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setSimulation(response.data.simulation)
    } catch (err: any) {
      console.error(err)

      setError(
        err.response?.data?.message ||
          'Route simulation failed'
      )
    } finally {
      setLoading(false)
    }
  }

  const sourceLocation = locations.find(
    (location) => location.id === Number(sourceId)
  )

  const destinationLocation = locations.find(
    (location) => location.id === Number(destinationId)
  )

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            What-if Route Simulation
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Simulate route distance, duration and vehicle
            utilization before creating a trip.
          </p>
        </div>

        {/* Input Card */}
        <div className="rounded-xl bg-white p-6 shadow-sm">

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

            {/* Source */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Source Warehouse
              </label>

              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
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

            {/* Vehicle */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Vehicle
              </label>

              <select
                value={vehicleId}
                onChange={(e) =>
                  setVehicleId(e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
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
            </div>

            {/* Quantity */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Quantity (KG)
              </label>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                placeholder="Enter quantity"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Button */}
          <div className="mt-5">
            <button
              onClick={handleSimulate}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? 'Simulating...'
                : 'Simulate Route'}
            </button>
          </div>
        </div>

        {/* Results */}
        {simulation && (
          <>
            {/* Result Cards */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Distance
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {simulation.route.distance_km} KM
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Estimated Time
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {simulation.route.duration_minutes} min
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Vehicle Capacity
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {simulation.vehicle.capacity_kg} KG
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Load
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {simulation.quantity_kg} KG
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Utilization
                </p>

                <p className="mt-2 text-2xl font-bold text-blue-600">
                  {simulation.vehicle_utilization_percent}%
                </p>
              </div>
            </div>

            {/* Route Details */}
            <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">

              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Simulation Route
              </h2>

              <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">

                <div>
                  <p className="text-xs text-slate-500">
                    Source
                  </p>

                  <p className="font-medium text-slate-900">
                    {simulation.source}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Destination
                  </p>

                  <p className="font-medium text-slate-900">
                    {simulation.destination}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Vehicle
                  </p>

                  <p className="font-medium text-slate-900">
                    {simulation.vehicle.vehicle_number}
                  </p>
                </div>
              </div>

              {/* Map */}
              {sourceLocation &&
                destinationLocation && (
                  <RouteMap
                    source={{
                      latitude: Number(
                        sourceLocation.latitude
                      ),
                      longitude: Number(
                        sourceLocation.longitude
                      ),
                      name: sourceLocation.name,
                    }}
                    destination={{
                      latitude: Number(
                        destinationLocation.latitude
                      ),
                      longitude: Number(
                        destinationLocation.longitude
                      ),
                      name: destinationLocation.name,
                    }}
                    geometry={
                      simulation.route.geometry
                    }
                  />
                )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default WhatIfSimulation