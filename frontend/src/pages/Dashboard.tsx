import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import LogisticsInsights from '../components/LogisticsInsights'

interface Analytics {
  orders: {
    total: number
    pending: number
    processing: number
    completed: number
    total_quantity_kg: string
  }

  trips: {
    total: number
    planned: number
    active: number
    completed: number
    cancelled: number
    total_distance_km: string
    total_duration_minutes: number
  }

  vehicles: {
    total: number
    available: number
    in_transit: number
    maintenance: number
  }

  commodities: {
    commodity: string
    order_count: number
    quantity_kg: string
  }[]
}

const ORDER_COLORS = [
  '#f59e0b',
  '#3b82f6',
  '#22c55e',
]

const VEHICLE_COLORS = [
  '#22c55e',
  '#3b82f6',
  '#ef4444',
]

const Dashboard = () => {
  const [analytics, setAnalytics] =
    useState<Analytics | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token =
          localStorage.getItem('token')

        if (!token) {
          setError(
            'Authentication token not found.'
          )
          return
        }

        const response = await axios.get(
          'http://localhost:5000/api/analytics',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        setAnalytics(
          response.data.analytics
        )
      } catch (err) {
        console.error(
          'Analytics fetch error:',
          err
        )

        setError(
          'Failed to load analytics.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  // -----------------------------------------
  // Loading
  // -----------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white md:p-8">
        <div className="w-full">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />

              <p className="text-sm text-slate-400">
                Loading analytics...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // -----------------------------------------
  // Error
  // -----------------------------------------
  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white md:p-8">
        <div className="w-full">
          <div className="rounded-2xl border border-red-800 bg-red-950/40 p-5 text-red-300">
            {error ||
              'Analytics data unavailable.'}
          </div>
        </div>
      </div>
    )
  }

  // -----------------------------------------
  // Chart Data
  // -----------------------------------------
  const orderStatusData = [
    {
      name: 'Pending',
      value: analytics.orders.pending,
    },
    {
      name: 'Processing',
      value: analytics.orders.processing,
    },
    {
      name: 'Completed',
      value: analytics.orders.completed,
    },
  ]

  const vehicleStatusData = [
    {
      name: 'Available',
      value: analytics.vehicles.available,
    },
    {
      name: 'In Transit',
      value: analytics.vehicles.in_transit,
    },
    {
      name: 'Maintenance',
      value: analytics.vehicles.maintenance,
    },
  ]

  const commodityData =
    analytics.commodities.map(
      (item) => ({
        commodity: item.commodity,
        quantity: Number(
          item.quantity_kg
        ),
      })
    )

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white md:p-8">

      <main className="min-h-screen">
        <div className="w-full">

          {/* =====================================
              HEADER
          ====================================== */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Logistics Analytics
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Overview of your logistics operations
              </p>
            </div>

            {/* System Status */}
            <div className="w-fit rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 shadow-lg">

              <p className="text-xs text-slate-500">
                System Status
              </p>

              <div className="mt-1 flex items-center gap-2">

                <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.7)]" />

                <span className="text-sm font-medium text-green-400">
                  Operational
                </span>

              </div>
            </div>

          </div>

          {/* =====================================
              SUMMARY CARDS
          ====================================== */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {/* Total Orders */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition hover:border-slate-700">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-400">
                  Total Orders
                </p>

                <span className="rounded-lg bg-blue-500/10 px-2 py-1 text-lg">
                  📦
                </span>

              </div>

              <p className="mt-3 text-3xl font-bold text-white">
                {analytics.orders.total}
              </p>

              <p className="mt-2 text-sm text-yellow-400">
                {analytics.orders.pending} pending
              </p>

            </div>

            {/* Total Trips */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition hover:border-slate-700">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-400">
                  Total Trips
                </p>

                <span className="rounded-lg bg-green-500/10 px-2 py-1 text-lg">
                  🛣️
                </span>

              </div>

              <p className="mt-3 text-3xl font-bold text-white">
                {analytics.trips.total}
              </p>

              <p className="mt-2 text-sm text-green-400">
                {analytics.trips.completed}{' '}
                completed
              </p>

            </div>

            {/* Total Vehicles */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition hover:border-slate-700">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-400">
                  Total Vehicles
                </p>

                <span className="rounded-lg bg-purple-500/10 px-2 py-1 text-lg">
                  🚚
                </span>

              </div>

              <p className="mt-3 text-3xl font-bold text-white">
                {analytics.vehicles.total}
              </p>

              <p className="mt-2 text-sm text-blue-400">
                {analytics.vehicles.available}{' '}
                available
              </p>

            </div>

            {/* Total Quantity */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition hover:border-slate-700">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-400">
                  Total Quantity
                </p>

                <span className="rounded-lg bg-orange-500/10 px-2 py-1 text-lg">
                  ⚖️
                </span>

              </div>

              <p className="mt-3 text-3xl font-bold text-white">
                {Number(
                  analytics.orders.total_quantity_kg
                ).toLocaleString()}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                KG
              </p>

            </div>

          </div>

          {/* =====================================
              OPERATIONAL METRICS
          ====================================== */}
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {/* Distance */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">

              <p className="text-sm text-slate-400">
                Total Distance
              </p>

              <p className="mt-2 text-2xl font-bold text-white">

                {Number(
                  analytics.trips.total_distance_km
                ).toFixed(2)}{' '}

                <span className="text-sm font-medium text-slate-400">
                  KM
                </span>

              </p>

            </div>

            {/* Duration */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">

              <p className="text-sm text-slate-400">
                Total Trip Duration
              </p>

              <p className="mt-2 text-2xl font-bold text-white">

                {analytics.trips.total_duration_minutes}{' '}

                <span className="text-sm font-medium text-slate-400">
                  min
                </span>

              </p>

            </div>

            {/* Active Trips */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">

              <p className="text-sm text-slate-400">
                Active Trips
              </p>

              <p className="mt-2 text-2xl font-bold text-white">
                {analytics.trips.active}
              </p>

            </div>

          </div>

          {/* =====================================
              PIE CHARTS
          ====================================== */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">

            {/* Order Status */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">

              <div className="mb-3">
                <h2 className="text-lg font-semibold text-white">
                  Order Status
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Current order distribution
                </p>
              </div>

              <div className="h-[280px] overflow-hidden rounded-xl bg-slate-900">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>

                    <Pie
                      data={orderStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="48%"
                      outerRadius={85}
                      label
                    >
                      {orderStatusData.map(
                        (_entry, index) => (
                          <Cell
                            key={index}
                            fill={
                              ORDER_COLORS[index]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor:
                          '#0f172a',
                        border:
                          '1px solid #334155',
                        borderRadius:
                          '10px',
                        color: '#ffffff',
                      }}
                      labelStyle={{
                        color: '#ffffff',
                      }}
                    />

                    <Legend
                      wrapperStyle={{
                        color: '#94a3b8',
                        fontSize: '14px',
                      }}
                    />

                  </PieChart>
                </ResponsiveContainer>

              </div>

            </div>

            {/* Vehicle Status */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">

              <div className="mb-3">
                <h2 className="text-lg font-semibold text-white">
                  Vehicle Status
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Current vehicle availability
                </p>
              </div>

              <div className="h-[280px] overflow-hidden rounded-xl bg-slate-900">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>

                    <Pie
                      data={vehicleStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="48%"
                      outerRadius={85}
                      label
                    >
                      {vehicleStatusData.map(
                        (_entry, index) => (
                          <Cell
                            key={index}
                            fill={
                              VEHICLE_COLORS[index]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor:
                          '#0f172a',
                        border:
                          '1px solid #334155',
                        borderRadius:
                          '10px',
                        color: '#ffffff',
                      }}
                      labelStyle={{
                        color: '#ffffff',
                      }}
                    />

                    <Legend
                      wrapperStyle={{
                        color: '#94a3b8',
                        fontSize: '14px',
                      }}
                    />

                  </PieChart>
                </ResponsiveContainer>

              </div>

            </div>

          </div>

          {/* =====================================
              COMMODITY QUANTITY
          ====================================== */}
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">

            <div className="mb-4">
              <h2 className="text-lg font-semibold text-white">
                Commodity Quantity
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Quantity distribution by commodity
              </p>
            </div>

            {/* Explicit dark chart area */}
            <div className="h-[320px] overflow-hidden rounded-xl bg-slate-900">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={commodityData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid
                    stroke="#334155"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="commodity"
                    stroke="#94a3b8"
                    tick={{
                      fill: '#94a3b8',
                      fontSize: 13,
                    }}
                    axisLine={{
                      stroke: '#334155',
                    }}
                    tickLine={false}
                  />

                  <YAxis
                    stroke="#94a3b8"
                    tick={{
                      fill: '#94a3b8',
                      fontSize: 13,
                    }}
                    axisLine={{
                      stroke: '#334155',
                    }}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        '#0f172a',
                      border:
                        '1px solid #334155',
                      borderRadius:
                        '10px',
                      color: '#ffffff',
                    }}
                    labelStyle={{
                      color: '#ffffff',
                    }}
                    itemStyle={{
                      color: '#a78bfa',
                    }}
                    formatter={(
                      value
                    ) => [
                      `${Number(
                        value
                      ).toLocaleString()} KG`,
                      'Quantity',
                    ]}
                  />

                  <Bar
                    dataKey="quantity"
                    name="Quantity"
                    fill="#8b5cf6"
                    radius={[
                      8,
                      8,
                      0,
                      0,
                    ]}
                    maxBarSize={120}
                  />

                </BarChart>
              </ResponsiveContainer>

            </div>

          </div>

          {/* =====================================
              LOGISTICS INSIGHTS
          ====================================== */}
          <LogisticsInsights />

        </div>
      </main>

    </div>
  )
}

export default Dashboard