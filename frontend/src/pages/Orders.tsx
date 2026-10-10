import { useEffect, useState } from 'react'
import axios from 'axios'

interface Order {
  id: number
  order_number: string
  source_location_name: string
  destination_location_name: string
  commodity: string
  quantity_kg: string
  status: string
  priority: string
  expected_delivery_date: string
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOrders = async () => {
    try {
      setLoading(true)

      const token = localStorage.getItem('token')

      const response = await axios.get(
        'http://localhost:5000/api/orders',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setOrders(response.data.orders)
    } catch (error: any) {
      console.error('Orders error:', error)

      setError(
        error.response?.data?.message ||
          'Failed to load orders'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <div className="w-full min-h-full bg-slate-50 text-slate-900">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Orders
        </h1>

        <p className="mt-1 text-slate-500">
          Manage and monitor logistics orders
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {loading ? (
          <div className="p-8 text-center text-slate-500">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No orders found
          </div>
        ) : (
          <div className="w-full overflow-x-auto">

            <table className="w-full border-collapse">

              <thead className="bg-slate-100">
                <tr>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                    Order
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                    Route
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                    Commodity
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                    Quantity
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                    Priority
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
                    Delivery Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-slate-200 transition hover:bg-slate-50"
                  >

                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {order.order_number}
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-sm text-slate-700">
                        {order.source_location_name}
                      </div>

                      <div className="my-1 text-xs text-slate-400">
                        ↓
                      </div>

                      <div className="text-sm text-slate-700">
                        {order.destination_location_name}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {order.commodity}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {order.quantity_kg} KG
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          order.priority === 'high'
                            ? 'bg-red-50 text-red-600'
                            : order.priority === 'normal'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {order.priority}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          order.status === 'completed'
                            ? 'bg-green-50 text-green-600'
                            : order.status === 'processing'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-yellow-50 text-yellow-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {new Date(
                        order.expected_delivery_date
                      ).toLocaleDateString('en-GB')}
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

export default Orders