import { Request, Response } from 'express'
import { pool } from '../config/db'

export const getDashboardSummary = async (
  _req: Request,
  res: Response
) => {
  try {
    const [
      ordersResult,
      tripsResult,
      vehiclesResult,
      quantityResult,
      distanceResult,
    ] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)::int AS total_orders,
          COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_orders,
          COUNT(*) FILTER (WHERE status = 'processing')::int AS processing_orders,
          COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_orders
        FROM orders
      `),

      pool.query(`
        SELECT
          COUNT(*)::int AS total_trips,
          COUNT(*) FILTER (WHERE status = 'planned')::int AS planned_trips,
          COUNT(*) FILTER (WHERE status = 'in_progress')::int AS active_trips,
          COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_trips,
          COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled_trips
        FROM trips
      `),

      pool.query(`
        SELECT
          COUNT(*)::int AS total_vehicles,
          COUNT(*) FILTER (WHERE status = 'available')::int AS available_vehicles,
          COUNT(*) FILTER (WHERE status = 'in_transit')::int AS in_transit_vehicles
        FROM vehicles
      `),

      pool.query(`
        SELECT
          COALESCE(SUM(quantity_kg), 0)::numeric AS total_quantity_kg
        FROM orders
      `),

      pool.query(`
        SELECT
          COALESCE(SUM(planned_distance_km), 0)::numeric
          AS total_planned_distance_km
        FROM trips
      `),
    ])

    return res.status(200).json({
      success: true,
      summary: {
  orders: ordersResult.rows[0],
  trips: tripsResult.rows[0],
  vehicles: vehiclesResult.rows[0],
  total_quantity_kg: quantityResult.rows[0].total_quantity_kg,
  total_planned_distance_km:
    distanceResult.rows[0].total_planned_distance_km,
},
    })
  } catch (error) {
    console.error('Dashboard summary error:', error)

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}