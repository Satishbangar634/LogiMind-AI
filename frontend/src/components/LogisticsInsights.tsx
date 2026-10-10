import { useEffect, useState } from 'react'
import axios from 'axios'

type Insight = {
  type: string
  title: string
  message: string
  severity: string
}

type InsightsData = {
  total_orders: number
  pending_orders: number
  total_quantity_kg: number
  total_vehicles: number
  available_vehicles: number
  total_trips: number
  active_trips: number
  completed_trips: number
  total_distance_km: number
}

const API_URL = 'http://localhost:5000'

const LogisticsInsights = () => {
  const [summary, setSummary] =
    useState<InsightsData | null>(null)

  const [insights, setInsights] =
    useState<Insight[]>([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const token =
          localStorage.getItem('token')

        const response = await axios.get(
          `${API_URL}/api/insights`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        setSummary(response.data.summary)
        setInsights(
          response.data.insights || []
        )
      } catch (error) {
        console.error(
          'Failed to load logistics insights:',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

  const getInsightIcon = (
    type: string
  ) => {
    switch (type) {
      case 'order':
        return '📦'

      case 'vehicle':
        return '🚚'

      case 'performance':
        return '📊'

      case 'capacity':
        return '🏋️'

      case 'trip':
        return '🛣️'

      case 'maintenance':
        return '🔧'

      default:
        return 'ℹ️'
    }
  }

  const getSeverityStyle = (
    severity: string
  ) => {
    switch (severity) {
      case 'critical':
        return {
          border: 'border-red-500/30',
          bg: 'bg-red-500/10',
          icon: 'bg-red-500/10',
          text: 'text-red-400',
        }

      case 'warning':
        return {
          border: 'border-yellow-500/30',
          bg: 'bg-yellow-500/10',
          icon: 'bg-yellow-500/10',
          text: 'text-yellow-400',
        }

      case 'success':
        return {
          border: 'border-green-500/30',
          bg: 'bg-green-500/10',
          icon: 'bg-green-500/10',
          text: 'text-green-400',
        }

      default:
        return {
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/10',
          icon: 'bg-blue-500/10',
          text: 'text-blue-400',
        }
    }
  }

  if (loading) {
    return (
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />

          <p className="text-sm text-slate-400">
            Loading logistics insights...
          </p>
        </div>
      </div>
    )
  }

  return (
    <section className="mt-8">

      {/* Header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">
          Logistics Insights
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Operational insights generated from current logistics data
        </p>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Pending Orders */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition hover:border-slate-700">

            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Pending Orders
              </p>

              <span className="rounded-lg bg-yellow-500/10 px-2 py-1 text-lg">
                📦
              </span>
            </div>

            <p className="mt-3 text-3xl font-bold text-yellow-400">
              {summary.pending_orders}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Orders waiting for processing
            </p>

          </div>

          {/* Available Vehicles */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition hover:border-slate-700">

            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Available Vehicles
              </p>

              <span className="rounded-lg bg-green-500/10 px-2 py-1 text-lg">
                🚚
              </span>
            </div>

            <p className="mt-3 text-3xl font-bold text-green-400">
              {summary.available_vehicles}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Vehicles ready for assignment
            </p>

          </div>

          {/* Completed Trips */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition hover:border-slate-700">

            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Completed Trips
              </p>

              <span className="rounded-lg bg-blue-500/10 px-2 py-1 text-lg">
                🛣️
              </span>
            </div>

            <p className="mt-3 text-3xl font-bold text-blue-400">
              {summary.completed_trips}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Successfully completed trips
            </p>

          </div>

          {/* Total Distance */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition hover:border-slate-700">

            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Total Distance
              </p>

              <span className="rounded-lg bg-purple-500/10 px-2 py-1 text-lg">
                📍
              </span>
            </div>

            <p className="mt-3 text-3xl font-bold text-purple-400">
              {summary.total_distance_km.toFixed(2)}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              KM planned across trips
            </p>

          </div>

        </div>
      )}

      {/* Insight Cards */}
      <div className="mt-5 grid gap-5 md:grid-cols-2">

        {insights.map(
          (insight, index) => {
            const style =
              getSeverityStyle(
                insight.severity
              )

            return (
              <div
                key={`${insight.type}-${index}`}
                className={`rounded-2xl border ${style.border} ${style.bg} p-5 transition hover:border-slate-600`}
              >
                <div className="flex items-start gap-4">

                  {/* Icon */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.icon} text-xl`}
                  >
                    {getInsightIcon(
                      insight.type
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0">

                    <div className="flex items-center gap-2">

                      <h3 className="font-semibold text-white">
                        {insight.title}
                      </h3>

                      <span
                        className={`text-xs font-medium capitalize ${style.text}`}
                      >
                        {insight.severity}
                      </span>

                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {insight.message}
                    </p>

                  </div>

                </div>
              </div>
            )
          }
        )}

      </div>

      {/* Empty State */}
      {insights.length === 0 && (
        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="text-3xl">
            📊
          </div>

          <h3 className="mt-3 font-semibold text-white">
            No insights available
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            There are currently no operational insights to display.
          </p>
        </div>
      )}

    </section>
  )
}

export default LogisticsInsights