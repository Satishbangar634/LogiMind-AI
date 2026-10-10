import { Request, Response } from 'express'
import { pool } from '../config/db'

export const getLogisticsInsights = async (
  _req: Request,
  res: Response
) => {
  try {
    // Orders
    const ordersResult = await pool.query(`
      SELECT
        COUNT(*)::int AS total_orders,
        COUNT(*) FILTER (
          WHERE status = 'pending'
        )::int AS pending_orders,
        COUNT(*) FILTER (
          WHERE status = 'processing'
        )::int AS processing_orders,
        COUNT(*) FILTER (
          WHERE status = 'completed'
        )::int AS completed_orders,
        COALESCE(SUM(quantity_kg), 0)::numeric
          AS total_quantity_kg
      FROM orders
    `)

    // Vehicles
    const vehiclesResult = await pool.query(`
      SELECT
        COUNT(*)::int AS total_vehicles,
        COUNT(*) FILTER (
          WHERE status = 'available'
        )::int AS available_vehicles,
        COUNT(*) FILTER (
          WHERE status = 'in_transit'
        )::int AS active_vehicles,
        COUNT(*) FILTER (
          WHERE status = 'maintenance'
        )::int AS maintenance_vehicles
      FROM vehicles
    `)

    // Trips
    const tripsResult = await pool.query(`
      SELECT
        COUNT(*)::int AS total_trips,
        COUNT(*) FILTER (
          WHERE status = 'planned'
        )::int AS planned_trips,
        COUNT(*) FILTER (
          WHERE status = 'in_progress'
        )::int AS active_trips,
        COUNT(*) FILTER (
          WHERE status = 'completed'
        )::int AS completed_trips,
        COALESCE(
          SUM(planned_distance_km),
          0
        )::numeric AS total_distance_km
      FROM trips
    `)

    // Highest capacity vehicle
    const vehicleCapacityResult = await pool.query(`
      SELECT
        vehicle_number,
        vehicle_type,
        capacity_kg,
        status
      FROM vehicles
      ORDER BY capacity_kg DESC
      LIMIT 1
    `)

    const orders = ordersResult.rows[0]
    const vehicles = vehiclesResult.rows[0]
    const trips = tripsResult.rows[0]

    const insights: {
      type: string
      title: string
      message: string
      severity: string
    }[] = []

    // Pending orders insight
    if (Number(orders.pending_orders) > 0) {
      insights.push({
        type: 'order',
        title: 'Pending Orders',
        message: `${orders.pending_orders} order(s) are currently pending.`,
        severity: 'warning',
      })
    }

    // Active trips insight
    if (Number(trips.active_trips) > 0) {
      insights.push({
        type: 'trip',
        title: 'Active Trips',
        message: `${trips.active_trips} trip(s) are currently in progress.`,
        severity: 'info',
      })
    }

    // Vehicle availability insight
    if (
      Number(vehicles.available_vehicles) === 0 &&
      Number(vehicles.total_vehicles) > 0
    ) {
      insights.push({
        type: 'vehicle',
        title: 'Vehicle Availability',
        message:
          'No vehicles are currently available for new trips.',
        severity: 'critical',
      })
    } else if (
      Number(vehicles.available_vehicles) > 0
    ) {
      insights.push({
        type: 'vehicle',
        title: 'Vehicle Availability',
        message: `${vehicles.available_vehicles} vehicle(s) are available for assignment.`,
        severity: 'success',
      })
    }

    // Maintenance insight
    if (Number(vehicles.maintenance_vehicles) > 0) {
      insights.push({
        type: 'maintenance',
        title: 'Vehicle Maintenance',
        message: `${vehicles.maintenance_vehicles} vehicle(s) are under maintenance.`,
        severity: 'warning',
      })
    }

    // Delivery completion insight
    if (Number(orders.total_orders) > 0) {
      const completionRate =
        (Number(orders.completed_orders) /
          Number(orders.total_orders)) *
        100

      insights.push({
        type: 'performance',
        title: 'Order Completion Rate',
        message: `${completionRate.toFixed(1)}% of orders are completed.`,
        severity:
          completionRate >= 80
            ? 'success'
            : 'info',
      })
    }

    // Capacity insight
    if (vehicleCapacityResult.rows.length > 0) {
      const vehicle =
        vehicleCapacityResult.rows[0]

      insights.push({
        type: 'capacity',
        title: 'Largest Vehicle Capacity',
        message: `${vehicle.vehicle_number} has a capacity of ${vehicle.capacity_kg} KG.`,
        severity: 'info',
      })
    }

    return res.status(200).json({
      success: true,

      summary: {
        total_orders: Number(orders.total_orders),
        pending_orders: Number(orders.pending_orders),
        total_quantity_kg: Number(
          orders.total_quantity_kg
        ),

        total_vehicles: Number(
          vehicles.total_vehicles
        ),
        available_vehicles: Number(
          vehicles.available_vehicles
        ),

        total_trips: Number(trips.total_trips),
        active_trips: Number(trips.active_trips),
        completed_trips: Number(
          trips.completed_trips
        ),

        total_distance_km: Number(
          trips.total_distance_km
        ),
      },

      insights,
    })
  } catch (error) {
    console.error(
      'Logistics insights error:',
      error
    )

    return res.status(500).json({
      success: false,
      message: 'Failed to generate logistics insights',
    })
  }
}