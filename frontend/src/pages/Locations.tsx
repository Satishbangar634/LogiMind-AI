import { FormEvent, useEffect, useState } from 'react'
import axios from 'axios'


interface Location {
  id: number
  name: string
  city: string
  state: string
  latitude: string
  longitude: string
  location_type: string
}

interface LocationForm {
  name: string
  city: string
  state: string
  latitude: string
  longitude: string
  location_type: string
}

const emptyForm: LocationForm = {
  name: '',
  city: '',
  state: '',
  latitude: '',
  longitude: '',
  location_type: 'warehouse',
}

const Locations = () => {
  const [locations, setLocations] = useState<Location[]>([])
  const [form, setForm] = useState<LocationForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const fetchLocations = async () => {
    try {
      setLoading(true)
      setError('')

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
      console.error('Locations error:', error)

      setError(
        error.response?.data?.message ||
          'Failed to load locations'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
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
      !form.name ||
      !form.city ||
      !form.state ||
      !form.latitude ||
      !form.longitude
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
        name: form.name,
        city: form.city,
        state: form.state,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        location_type: form.location_type,
      }

      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/locations/${editingId}`,
          payload,
          config
        )

        setMessage('Location updated successfully')
      } else {
        await axios.post(
          'http://localhost:5000/api/locations',
          payload,
          config
        )

        setMessage('Location added successfully')
      }

      setForm(emptyForm)
      setEditingId(null)

      await fetchLocations()
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Failed to save location'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (location: Location) => {
    setEditingId(location.id)

    setForm({
      name: location.name,
      city: location.city,
      state: location.state,
      latitude: location.latitude,
      longitude: location.longitude,
      location_type: location.location_type,
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
      'Are you sure you want to delete this location?'
    )

    if (!confirmed) {
      return
    }

    try {
      setError('')
      setMessage('')

      const token = localStorage.getItem('token')

      await axios.delete(
        `http://localhost:5000/api/locations/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setMessage('Location deleted successfully')

      await fetchLocations()
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Failed to delete location'
      )
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      

      
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Locations
          </h1>

          <p className="text-slate-400 mt-1">
            Manage warehouses, hubs and logistics locations
          </p>
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

        {/* Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-5">
            {editingId ? 'Edit Location' : 'Add Location'}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {/* Name */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Location Name
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Pune Central Warehouse"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                City
              </label>

              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Pune"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                State
              </label>

              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="Maharashtra"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* Latitude */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Latitude
              </label>

              <input
                type="number"
                step="any"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="18.5204303"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* Longitude */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Longitude
              </label>

              <input
                type="number"
                step="any"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="73.8567437"
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* Location Type */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Location Type
              </label>

              <select
                name="location_type"
                value={form.location_type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
              >
                <option value="warehouse">
                  Warehouse
                </option>

                <option value="hub">
                  Distribution Hub
                </option>

                <option value="depot">
                  Depot
                </option>

                <option value="store">
                  Store
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
                  ? 'Update Location'
                  : 'Add Location'}
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

        {/* Locations Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">
              Loading locations...
            </div>
          ) : locations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No locations found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm">
                      Name
                    </th>

                    <th className="px-5 py-4 text-left text-sm">
                      City
                    </th>

                    <th className="px-5 py-4 text-left text-sm">
                      State
                    </th>

                    <th className="px-5 py-4 text-left text-sm">
                      Coordinates
                    </th>

                    <th className="px-5 py-4 text-left text-sm">
                      Type
                    </th>

                    <th className="px-5 py-4 text-left text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {locations.map((location) => (
                    <tr
                      key={location.id}
                      className="border-t border-slate-800 hover:bg-slate-800/50"
                    >
                      <td className="px-5 py-4 font-medium">
                        {location.name}
                      </td>

                      <td className="px-5 py-4">
                        {location.city}
                      </td>

                      <td className="px-5 py-4">
                        {location.state}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-400">
                        {location.latitude},{' '}
                        {location.longitude}
                      </td>

                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400">
                          {location.location_type}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleEdit(location)
                            }
                            className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(location.id)
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

export default Locations