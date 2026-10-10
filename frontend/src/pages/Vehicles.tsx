import { FormEvent, useEffect, useState } from 'react'
import axios from 'axios'


interface Vehicle {
  id: number
  vehicle_number: string
  vehicle_type: string
  capacity_kg: string
  driver_name: string
  driver_phone: string
  status: string
}

interface VehicleForm {
  vehicle_number: string
  vehicle_type: string
  capacity_kg: string
  driver_name: string
  driver_phone: string
  status: string
}

const emptyForm: VehicleForm = {
  vehicle_number: '',
  vehicle_type: '',
  capacity_kg: '',
  driver_name: '',
  driver_phone: '',
  status: 'available',
}

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [form, setForm] = useState<VehicleForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('token')

      const response = await axios.get(
        'http://localhost:5000/api/vehicles',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setVehicles(response.data.vehicles)
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Failed to load vehicles'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    setError('')
    setMessage('')

    if (
      !form.vehicle_number ||
      !form.vehicle_type ||
      !form.capacity_kg ||
      !form.driver_name ||
      !form.driver_phone
    ) {
      setError('Please fill all required fields')
      return
    }

    try {
      setSaving(true)

      const token = localStorage.getItem('token')

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const payload = {
        vehicle_number: form.vehicle_number,
        vehicle_type: form.vehicle_type,
        capacity_kg: Number(form.capacity_kg),
        driver_name: form.driver_name,
        driver_phone: form.driver_phone,
        status: form.status,
      }

      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/vehicles/${editingId}`,
          payload,
          config
        )

        setMessage('Vehicle updated successfully')
      } else {
        await axios.post(
          'http://localhost:5000/api/vehicles',
          payload,
          config
        )

        setMessage('Vehicle added successfully')
      }

      setForm(emptyForm)
      setEditingId(null)

      await fetchVehicles()
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Failed to save vehicle'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.id)

    setForm({
      vehicle_number: vehicle.vehicle_number,
      vehicle_type: vehicle.vehicle_type,
      capacity_kg: vehicle.capacity_kg,
      driver_name: vehicle.driver_name,
      driver_phone: vehicle.driver_phone,
      status: vehicle.status,
    })

    setError('')
    setMessage('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setMessage('')
  }

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this vehicle?'
    )

    if (!confirmed) {
      return
    }

    try {
      setError('')
      setMessage('')

      const token = localStorage.getItem('token')

      await axios.delete(
        `http://localhost:5000/api/vehicles/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setMessage('Vehicle deleted successfully')

      await fetchVehicles()
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Failed to delete vehicle'
      )
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      

     
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Vehicles
            </h1>

            <p className="text-slate-400 mt-1">
              Manage fleet vehicles and driver information
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-400">
            {message}
          </div>
        )}

        {/* Vehicle Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-5">
            {editingId ? 'Edit Vehicle' : 'Add Vehicle'}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {/* Vehicle Number */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Vehicle Number
              </label>

              <input
                name="vehicle_number"
                value={form.vehicle_number}
                onChange={handleChange}
                placeholder="MH12AB1234"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Vehicle Type
              </label>

              <input
                name="vehicle_type"
                value={form.vehicle_type}
                onChange={handleChange}
                placeholder="Truck"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Capacity (KG)
              </label>

              <input
                type="number"
                name="capacity_kg"
                value={form.capacity_kg}
                onChange={handleChange}
                placeholder="10000"
                min="1"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* Driver */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Driver Name
              </label>

              <input
                name="driver_name"
                value={form.driver_name}
                onChange={handleChange}
                placeholder="Rahul Patil"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Driver Phone
              </label>

              <input
                name="driver_phone"
                value={form.driver_phone}
                onChange={handleChange}
                placeholder="9876543210"
                maxLength={10}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
              >
                <option value="available">
                  Available
                </option>

                <option value="in_transit">
                  In Transit
                </option>

                <option value="maintenance">
                  Maintenance
                </option>
              </select>
            </div>

            {/* Buttons */}
            <div className="md:col-span-2 lg:col-span-3 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold"
              >
                {saving
                  ? 'Saving...'
                  : editingId
                  ? 'Update Vehicle'
                  : 'Add Vehicle'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Vehicle Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">
              Loading vehicles...
            </div>
          ) : vehicles.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No vehicles found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm">
                      Vehicle Number
                    </th>

                    <th className="px-5 py-4 text-left text-sm">
                      Type
                    </th>

                    <th className="px-5 py-4 text-left text-sm">
                      Capacity
                    </th>

                    <th className="px-5 py-4 text-left text-sm">
                      Driver
                    </th>

                    <th className="px-5 py-4 text-left text-sm">
                      Phone
                    </th>

                    <th className="px-5 py-4 text-left text-sm">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="border-t border-slate-800 hover:bg-slate-800/50"
                    >
                      <td className="px-5 py-4 font-medium">
                        {vehicle.vehicle_number}
                      </td>

                      <td className="px-5 py-4">
                        {vehicle.vehicle_type}
                      </td>

                      <td className="px-5 py-4">
                        {vehicle.capacity_kg} KG
                      </td>

                      <td className="px-5 py-4">
                        {vehicle.driver_name}
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {vehicle.driver_phone}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            vehicle.status === 'available'
                              ? 'bg-green-500/10 text-green-400'
                              : vehicle.status === 'in_transit'
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-yellow-500/10 text-yellow-400'
                          }`}
                        >
                          {vehicle.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleEdit(vehicle)
                            }
                            className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(vehicle.id)
                            }
                            className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm"
                          >
                            Delete
                          </button>
                        </div>
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

export default Vehicles