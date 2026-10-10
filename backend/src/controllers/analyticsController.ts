import { Request, Response } from 'express'
import { pool } from '../config/db'

export const getAnalytics = async (
  _req: Request,
  res: Response
) => {
  try {
    const ordersResult = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
        COUNT(*) FILTER (WHERE status = 'processing')::int AS processing,
        COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
        COALESCE(SUM(quantity_kg), 0)::numeric AS total_quantity_kg
      FROM orders
    `)

    const tripsResult = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'planned')::int AS planned,
        COUNT(*) FILTER (WHERE status = 'in_progress')::int AS active,
        COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
        COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled,
        COALESCE(SUM(planned_distance_km), 0)::numeric
          AS total_distance_km,
        COALESCE(SUM(estimated_duration_minutes), 0)::int
          AS total_duration_minutes
      FROM trips
    `)

    const vehiclesResult = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'available')::int
          AS available,
        COUNT(*) FILTER (WHERE status = 'in_transit')::int
          AS in_transit,
        COUNT(*) FILTER (WHERE status = 'maintenance')::int
          AS maintenance
      FROM vehicles
    `)

    const commoditiesResult = await pool.query(`
      SELECT
        commodity,
        COUNT(*)::int AS order_count,
        COALESCE(SUM(quantity_kg), 0)::numeric AS quantity_kg
      FROM orders
      GROUP BY commodity
      ORDER BY quantity_kg DESC
    `)

    return res.status(200).json({
      success: true,
      analytics: {
        orders: ordersResult.rows[0],
        trips: tripsResult.rows[0],
        vehicles: vehiclesResult.rows[0],
        commodities: commoditiesResult.rows,
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
    })
  }
}